"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Loader2,
} from "lucide-react";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type CSVRow = {
  Name: string;
  Description: string;
  Price: string;
  Stock: string;
  Unit: string;
  Category: string;
  Tags: string;
  MinOrder: string;
  MaxOrder: string;
};

type ParsedProduct = {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  unit: string;
  category_id: Id<"categories">;
  tags: string[];
  min_order_quantity: number;
  max_order_quantity: number;
  images: string[];
  shop_id: Id<"shops">;
};

export default function BulkUploadContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  );

  const categories = useQuery(api.categories.getAllCategories, { is_active: true });

  const activeShop = shops?.[0];
  const bulkCreate = useMutation(api.products.bulkCreateProducts);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        error("Please upload a valid CSV file");
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    if (!categories || !activeShop) {
      error("System not ready. Please try again in a moment.");
      return;
    }

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const products: ParsedProduct[] = [];
        const newErrors: string[] = [];

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // Account for header and 0-index

          // Validation
          if (!row.Name || !row.Price || !row.Stock || !row.Unit || !row.Category) {
            newErrors.push(`Row ${rowNum}: Missing required fields`);
            return;
          }

          const price = parseFloat(row.Price);
          const stock = parseInt(row.Stock);
          const minOrder = parseInt(row.MinOrder || "1");
          const maxOrder = parseInt(row.MaxOrder || "10");

          if (isNaN(price) || isNaN(stock)) {
            newErrors.push(`Row ${rowNum}: Invalid number format`);
            return;
          }

          // Find category ID
          const category = categories.find(
            (c) => c.name.toLowerCase() === row.Category.toLowerCase()
          );

          if (!category) {
            newErrors.push(`Row ${rowNum}: Category '${row.Category}' not found`);
            return;
          }

          products.push({
            name: row.Name,
            description: row.Description || "",
            price,
            stock_quantity: stock,
            unit: row.Unit,
            category_id: category._id,
            tags: row.Tags ? row.Tags.split(",").map((t) => t.trim()) : [],
            min_order_quantity: minOrder,
            max_order_quantity: maxOrder,
            images: [], // Images not supported in CSV yet
            shop_id: activeShop._id,
          });
        });

        setParsedData(products);
        setErrors(newErrors);
      },
      error: (err) => {
        setErrors([`CSV Parse Error: ${err.message}`]);
      },
    });
  };

  const handleUpload = async () => {
    if (!dbUser || !parsedData.length) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Split into chunks of 50 to avoid timeout
      const chunkSize = 50;
      for (let i = 0; i < parsedData.length; i += chunkSize) {
        const chunk = parsedData.slice(i, i + chunkSize);
        await bulkCreate({
          products: chunk,
          owner_id: dbUser._id,
        });
        setUploadProgress(10 + ((i + chunkSize) / parsedData.length) * 90);
      }

      success(`Successfully uploaded ${parsedData.length} products`);
      setFile(null);
      setParsedData([]);
      setErrors([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      error("Failed to upload products");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Description,Price,Stock,Unit,Category,Tags,MinOrder,MaxOrder\nExample Product,This is a test product,100,50,kg,Vegetables,fresh organic,1,10";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!activeShop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Add multiple products at once using a CSV file.
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Upload a CSV file containing your product details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {file ? (
                <>
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                  <p className="font-medium text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                      setParsedData([]);
                      setErrors([]);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove File
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium text-lg">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">
                    CSV files only (max 5MB)
                  </p>
                </>
              )}
            </label>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 max-h-40 overflow-y-auto">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {parsedData.length > 0 && errors.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Preview ({parsedData.length} products)
            </h3>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading... {Math.round(uploadProgress)}%
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm Upload
                </>
              )}
            </Button>
          </div>

          {isUploading && <Progress value={uploadProgress} className="h-2" />}

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.slice(0, 10).map((product, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {categories?.find((c) => c._id === product.category_id)?.name}
                    </TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                  </TableRow>
                ))}
                {parsedData.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      ...and {parsedData.length - 10} more
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
