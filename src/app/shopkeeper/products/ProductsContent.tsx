"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
  AlertCircle,
  BookPlus,
  Package,
  PlusCircle,
  ShoppingBag,
  Store,
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ImageUpload";
import HierarchicalCategorySelector from "@/components/HierarchicalCategorySelector";

type Shop = {
  _id: Id<"shops">;
  name: string;
};

type Category = {
  _id: Id<"categories">;
  name: string;
};

const initialForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  minOrder: "1",
  maxOrder: "10",
  unit: "kg",
  categoryId: "",
  tags: "",
  images: [] as string[],
};

export default function ProductsContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [form, setForm] = useState(initialForm);
  const [selectedShop, setSelectedShop] = useState<Id<"shops"> | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Shop[] | null | undefined;

  const categories = useQuery(
    api.categories.getAllCategories,
    { is_active: true },
  ) as Category[] | null | undefined;

  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip",
  ) as { status?: "approved" | "pending" | "rejected" } | null | undefined;

  const activeShop = useMemo(() => {
    if (!shops || shops.length === 0) return null;
    if (selectedShop) {
      return shops.find((shop) => shop._id === selectedShop) ?? shops[0];
    }
    return shops[0];
  }, [shops, selectedShop]);

  // Removed products query - not needed on add product page

  useEffect(() => {
    if (!selectedShop && shops && shops.length > 0) {
      setSelectedShop(shops[0]._id);
    }
  }, [shops, selectedShop]);

  const createProduct = useMutation(api.products.createProduct);

  const handleChange = (field: keyof typeof form) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop) {
      error("Create your shop profile before adding products.");
      return;
    }
    if (!form.categoryId) {
      error("Choose a category for this product.");
      return;
    }
    const numericFields = [
      "price",
      "stock",
      "minOrder",
      "maxOrder",
      "originalPrice",
    ] as const;
    for (const field of numericFields) {
      if (field === "originalPrice" && !form[field]) continue;
      if (!form[field] || Number.isNaN(Number(form[field]))) {
        error(`Please enter a valid number for ${field}.`);
        return;
      }
    }

    const parsedTags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const parsedImages = form.images.filter(Boolean);

    try {
      setSubmitting(true);
      await createProduct({
        name: form.name,
        description: form.description || undefined,
        shop_id: activeShop._id,
        category_id: form.categoryId as Id<"categories">,
        price: Number(form.price),
        original_price: form.originalPrice ? Number(form.originalPrice) : undefined,
        stock_quantity: Number(form.stock),
        min_order_quantity: Number(form.minOrder),
        max_order_quantity: Number(form.maxOrder),
        unit: form.unit,
        images: parsedImages.length > 0 ? parsedImages : [],
        tags: parsedTags,
        is_featured: false,
      });

      success("Product added to your shop catalogue.");
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      error("Failed to create product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader />
      </div>
    );
  }

  if (shops === undefined || categories === undefined || registration === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader text="Fetching shop data…" />
      </div>
    );
  }

  if (!shops || shops.length === 0) {
    if (registration?.status === "approved") {
      return (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Store className="h-5 w-5" />
              Create Your Shop First
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your registration is approved! Create your shop profile to start adding products.
            </p>
            <Button asChild>
              <a href="/shopkeeper/shop/create">Create Shop</a>
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            No shop detected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {registration?.status === "pending"
              ? "Your registration is pending approval. Once approved, you can create your shop."
              : "Complete your shop registration before adding products."}
          </p>
          <Button asChild>
            <a href="/shopkeeper/registration">Complete registration</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Product Management
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                  Add New Product
                </h1>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Create and manage your product catalog. Add detailed information, pricing, and images to help customers discover your products.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label className="text-sm font-medium text-foreground">Active Shop</Label>
            <Select
              value={activeShop?._id || undefined}
              onValueChange={(value) =>
                setSelectedShop(value as Id<"shops">)
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop._id} value={shop._id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookPlus className="h-5 w-5 text-primary" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-2 block">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      required
                      placeholder="e.g. Organic Alphonso Mango"
                      value={form.name}
                      onChange={handleChange("name")}
                      className="bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={handleChange("description")}
                      placeholder="Provide a detailed description of your product..."
                      className="min-h-[100px] bg-background border-border resize-none"
                      aria-describedby="description-help"
                    />
                    <p id="description-help" className="text-xs text-muted-foreground mt-1">
                      Help customers understand what makes your product special
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Pricing Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Pricing & Inventory
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium text-foreground mb-2 block">
                        Selling Price (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.price}
                        onChange={handleChange("price")}
                        placeholder="0.00"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="text-sm font-medium text-foreground mb-2 block">
                        Original Price (₹)
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.originalPrice}
                        onChange={handleChange("originalPrice")}
                        placeholder="0.00"
                        className="bg-background border-border"
                        aria-describedby="original-price-help"
                      />
                      <p id="original-price-help" className="text-xs text-muted-foreground mt-1">
                        Leave empty if no discount
                      </p>
                    </div>
                  </div>
                </div>

                

                {/* Inventory & Ordering */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Inventory & Ordering
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stock" className="text-sm font-medium text-foreground mb-2 block">
                        Stock Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        required
                        value={form.stock}
                        onChange={handleChange("stock")}
                        placeholder="0"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minOrder" className="text-sm font-medium text-foreground mb-2 block">
                        Min Order <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="minOrder"
                        type="number"
                        min="1"
                        required
                        value={form.minOrder}
                        onChange={handleChange("minOrder")}
                        placeholder="1"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxOrder" className="text-sm font-medium text-foreground mb-2 block">
                        Max Order <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="maxOrder"
                        type="number"
                        min="1"
                        required
                        value={form.maxOrder}
                        onChange={handleChange("maxOrder")}
                        placeholder="10"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Category & Classification */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Category & Classification
                  </h3>
                  <HierarchicalCategorySelector
                    value={form.categoryId as Id<"categories"> | undefined}
                    onChange={(categoryId) =>
                      setForm((prev) => ({ ...prev, categoryId }))
                    }
                    label="Product Category"
                    required
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit" className="text-sm font-medium text-foreground mb-2 block">
                        Unit <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="unit"
                        value={form.unit}
                        onChange={handleChange("unit")}
                        placeholder="kg, L, pcs, etc."
                        required
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={form.tags}
                      onChange={handleChange("tags")}
                      placeholder="organic, bestseller, breakfast (comma separated)"
                      className="bg-background border-border"
                      aria-describedby="tags-help"
                    />
                    <p id="tags-help" className="text-xs text-muted-foreground mt-1">
                      Add tags to help customers discover your product
                    </p>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Images Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">
                      Product Images
                    </Label>
                    <ImageUpload
                      images={form.images}
                      onChange={(images) => setForm((prev) => ({ ...prev, images }))}
                      maxImages={5}
                    />
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Submit Button */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 sm:flex-none sm:min-w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader />
                        <span className="ml-2">Creating Product...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(initialForm)}
                    disabled={isSubmitting}
                    className="border-border"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Tips & Help */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Descriptive Names</p>
                    <p className="text-xs text-muted-foreground">
                      Use clear, search-friendly product names that customers can easily find.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Stock Management</p>
                    <p className="text-xs text-muted-foreground">
                      Keep stock updated regularly. Products are automatically hidden when stock reaches zero.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Smart Tagging</p>
                    <p className="text-xs text-muted-foreground">
                      Use relevant tags like &quot;keto&quot;, &quot;school tiffin&quot;, &quot;winter care&quot; to improve discoverability.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Quality Images</p>
                    <p className="text-xs text-muted-foreground">
                      Upload clear, high-quality images. First image will be used as the main product image.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-muted/30 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Need Help?</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  View all your products in the{" "}
                  <a
                    href="/shopkeeper/shop/products"
                    className="text-primary hover:underline font-medium"
                  >
                    Shop Products
                  </a>{" "}
                  page to manage inventory and availability.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Loader({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
      <Package className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}

