"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  data?: any;
}

export default function ImageUploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getFileUrl);

  const addLog = (type: LogEntry["type"], message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data,
    };
    setLogs((prev) => [...prev, entry]);
    console.log(`[${type.toUpperCase()}] ${message}`, data || "");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(null);
      setStorageId(null);
      setLogs([]);
      addLog("info", "File selected", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addLog("error", "No file selected");
      return;
    }

    setUploading(true);
    setImageUrl(null);
    setStorageId(null);
    setLogs([]);

    try {
      // Step 1: Generate upload URL
      addLog("info", "Step 1: Generating upload URL...");
      const uploadUrl = await generateUploadUrl();
      addLog("success", "Upload URL generated", { uploadUrl });

      // Step 2: Upload file
      addLog("info", "Step 2: Uploading file to Convex storage...", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      addLog("info", "Upload response received", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        ok: uploadResponse.ok,
        headers: Object.fromEntries(uploadResponse.headers.entries()),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        addLog("error", "Upload failed", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
        });
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Step 3: Get storageId from response
      addLog("info", "Step 3: Extracting storageId from response...");
      const responseText = await uploadResponse.text();
      addLog("info", "Raw response text", { responseText });

      let extractedStorageId: string;

      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(responseText);
        addLog("info", "Response parsed as JSON", { parsed });

        if (typeof parsed === "string") {
          extractedStorageId = parsed;
        } else if (parsed && typeof parsed === "object") {
          if ("storageId" in parsed && typeof parsed.storageId === "string") {
            extractedStorageId = parsed.storageId;
          } else if ("_id" in parsed && typeof parsed._id === "string") {
            extractedStorageId = parsed._id;
          } else {
            // Try to find any string value in the object
            const stringValue = Object.values(parsed).find(
              (v) => typeof v === "string"
            ) as string | undefined;
            if (stringValue) {
              extractedStorageId = stringValue;
            } else {
              throw new Error("No string value found in response object");
            }
          }
        } else {
          extractedStorageId = responseText.trim().replace(/^"|"$/g, "");
        }
      } catch (parseError) {
        addLog("warning", "Failed to parse as JSON, treating as plain text", {
          error: parseError,
        });
        extractedStorageId = responseText.trim().replace(/^"|"$/g, "");
      }

      addLog("success", "StorageId extracted", { storageId: extractedStorageId });
      setStorageId(extractedStorageId);

      // Step 4: Get file URL
      addLog("info", "Step 4: Getting file URL from Convex...", {
        storageId: extractedStorageId,
      });

      try {
        const fileUrl = await getFileUrl({
          storageId: extractedStorageId as any,
        });

        if (fileUrl) {
          addLog("success", "File URL retrieved", { fileUrl });
          setImageUrl(fileUrl);
        } else {
          addLog("error", "File URL is null or undefined");
        }
      } catch (urlError: any) {
        addLog("error", "Failed to get file URL", {
          error: urlError.message,
          stack: urlError.stack,
          storageId: extractedStorageId,
        });
        throw urlError;
      }

      addLog("success", "Upload completed successfully!");
    } catch (error: any) {
      addLog("error", "Upload failed with error", {
        message: error.message,
        stack: error.stack,
        error: error,
      });
    } finally {
      setUploading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Image Upload Test Page
          </h1>
          <p className="text-muted-foreground">
            Test image upload functionality with detailed logging
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Select Image File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="bg-background"
                />
              </div>

              {selectedFile && (
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium text-foreground">
                        {selectedFile.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium text-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium text-foreground">
                        {selectedFile.type}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </>
                )}
              </Button>

              {storageId && (
                <div className="p-4 border border-border rounded-lg bg-muted/30">
                  <Label className="text-sm font-semibold mb-2 block">
                    Storage ID
                  </Label>
                  <code className="text-xs break-all text-foreground">
                    {storageId}
                  </code>
                </div>
              )}

              {imageUrl && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Uploaded Image</Label>
                  <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={imageUrl}
                      alt="Uploaded image"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized={imageUrl.includes("convex.cloud")}
                    />
                  </div>
                  <div className="p-3 border border-border rounded-lg bg-muted/30">
                    <Label className="text-xs font-semibold mb-1 block">
                      Image URL
                    </Label>
                    <code className="text-xs break-all text-foreground">
                      {imageUrl}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs Section */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Logs & Debug Info
              </CardTitle>
              {logs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearLogs}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No logs yet. Select a file and upload to see logs.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getLogColor(
                        log.type
                      )}`}
                    >
                      <div className="flex items-start gap-2">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${log.type === "success"
                                ? "border-green-500 text-green-700 dark:text-green-300"
                                : log.type === "error"
                                  ? "border-red-500 text-red-700 dark:text-red-300"
                                  : log.type === "warning"
                                    ? "border-yellow-500 text-yellow-700 dark:text-yellow-300"
                                    : "border-blue-500 text-blue-700 dark:text-blue-300"
                                }`}
                            >
                              {log.type.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {log.message}
                          </p>
                          {log.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="mt-2 p-2 bg-background border border-border rounded text-xs overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        {logs.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-foreground">
                    {logs.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Logs</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {logs.filter((l) => l.type === "success").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Success</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {logs.filter((l) => l.type === "error").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {logs.filter((l) => l.type === "warning").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

