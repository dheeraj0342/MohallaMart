"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Id } from "@/../convex/_generated/dataModel";

// Image optimization settings
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.85; // 85% quality for good balance
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB target after compression

/**
 * Compress and optimize image before upload
 */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format - preserve PNG for transparency, use JPEG for others
        const isPNG = file.type === "image/png";
        const outputFormat = isPNG ? "image/png" : "image/jpeg";
        const outputQuality = isPNG ? 0.9 : QUALITY; // PNG doesn't use quality, but we'll use it for JPEG

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // If still too large and not PNG, reduce quality further
            if (blob.size > MAX_FILE_SIZE && !isPNG) {
              canvas.toBlob(
                (smallerBlob) => {
                  if (!smallerBlob) {
                    reject(new Error("Failed to compress image"));
                    return;
                  }
                  // Create new file with optimized blob
                  const optimizedFile = new File(
                    [smallerBlob],
                    file.name.replace(/\.[^/.]+$/, ".jpg"),
                    {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    }
                  );
                  resolve(optimizedFile);
                },
                "image/jpeg",
                0.6 // Lower quality if still too large
              );
            } else {
              // Create new file with optimized blob
              const fileExtension = isPNG ? ".png" : ".jpg";
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, fileExtension),
                {
                  type: outputFormat,
                  lastModified: Date.now(),
                }
              );
              resolve(optimizedFile);
            }
          },
          outputFormat,
          outputQuality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      error(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          error(`${file.name} is not an image file.`);
          continue;
        }

        // Validate original file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
          error(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Compress and optimize image
        let optimizedFile: File;
        try {
          optimizedFile = await compressImage(file);
          const sizeReduction = ((file.size - optimizedFile.size) / file.size * 100).toFixed(1);
          if (parseFloat(sizeReduction) > 10) {
            console.log(`Image ${file.name} compressed by ${sizeReduction}%`);
          }
        } catch (compressError) {
          console.error("Compression error:", compressError);
          // If compression fails, use original file
          optimizedFile = file;
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload optimized file to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": optimizedFile.type },
          body: optimizedFile,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Convex returns the storageId as a string in the response body
        const responseText = await result.text();
        let storageId: Id<"_storage">;

        try {
          // Try to parse as JSON first (in case it's wrapped)
          const parsed = JSON.parse(responseText);
          if (typeof parsed === "string") {
            storageId = parsed as Id<"_storage">;
          } else if (parsed && typeof parsed === "object") {
            // Handle object responses
            if ("storageId" in parsed && typeof parsed.storageId === "string") {
              storageId = parsed.storageId as Id<"_storage">;
            } else if ("_id" in parsed && typeof parsed._id === "string") {
              storageId = parsed._id as Id<"_storage">;
            } else {
              // If it's the storageId object itself, extract the value
              storageId = responseText.trim().replace(/^"|"$/g, "") as Id<"_storage">;
            }
          } else {
            storageId = responseText.trim().replace(/^"|"$/g, "") as Id<"_storage">;
          }
        } catch {
          // If not JSON, treat as plain string
          storageId = responseText.trim().replace(/^"|"$/g, "") as Id<"_storage">;
        }

        // Validate storageId format
        if (!storageId || typeof storageId !== "string") {
          throw new Error(`Invalid storageId received for ${file.name}: ${JSON.stringify(responseText)}`);
        }

        // Get the file URL from Convex storage
        const fileUrl = await getFileUrl({ storageId });

        if (fileUrl) {
          newImageUrls.push(fileUrl);
        } else {
          throw new Error(`Failed to get URL for ${file.name}`);
        }
      }

      onChange([...images, ...newImageUrls]);
      success(`Successfully uploaded ${newImageUrls.length} image(s).`);
    } catch (err) {
      console.error("Upload error:", err);
      error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Product Images
        </label>
        <span className="text-xs text-muted-foreground">
          ({images.length}/{maxImages})
        </span>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg border border-border bg-muted overflow-hidden"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized={url.includes("convex.cloud")}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images ({images.length}/{maxImages})
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Upload up to {maxImages} images. Images are automatically optimized and compressed.
          </p>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 bg-muted/30">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            No images uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}

