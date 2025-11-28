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
  Tag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Shop = {
  _id: Id<"shops">;
  name: string;
};

type Category = {
  _id: Id<"categories">;
  name: string;
};

type Product = {
  _id: Id<"products">;
  name: string;
  price: number;
  stock_quantity: number;
  unit: string;
  is_available: boolean;
  category_id: Id<"categories">;
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
  images: "",
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

  const activeShop = useMemo(() => {
    if (!shops || shops.length === 0) return null;
    if (selectedShop) {
      return shops.find((shop) => shop._id === selectedShop) ?? shops[0];
    }
    return shops[0];
  }, [shops, selectedShop]);

  const products = useQuery(
    api.products.getProductsByShop,
    activeShop ? { shop_id: activeShop._id } : "skip",
  ) as Product[] | null | undefined;

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
    const parsedImages = form.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

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
        images: parsedImages.length > 0 ? parsedImages : ["https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80"],
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

  if (shops === undefined || categories === undefined) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <Loader text="Fetching shop data…" />
      </div>
    );
  }

  if (!shops || shops.length === 0) {
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
            Finish your shop registration before adding products.
          </p>
          <Button asChild>
            <a href="/shopkeeper/registration">Complete registration</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border bg-linear-to-br from-green-600 via-green-500 to-green-400 text-white p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">
              Catalogue Builder
            </p>
            <h1 className="text-3xl font-bold mt-1">Manage shop inventory</h1>
            <p className="text-white/80 mt-2 max-w-2xl text-sm sm:text-base">
              Add branded SKUs, set pricing, and control availability. Each product
              stays linked to the selected shop, so customers only see what you stock.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-white/80">Active shop</span>
            <Select
              value={activeShop?._id || undefined}
              onValueChange={(value) =>
                setSelectedShop(value as Id<"shops">)
              }
            >
              <SelectTrigger className="bg-white/10 text-white border-white/40 min-w-[200px]">
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
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Products in this shop
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {products?.length ?? 0} total
              </span>
            </CardHeader>
            <CardContent>
              {products === undefined ? (
                <Loader text="Loading products…" />
              ) : products && products.length > 0 ? (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-xl border px-4 py-3 flex items-center justify-between text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <span>₹{product.price.toFixed(2)}</span>
                          <span className="text-xs">•</span>
                          <span>
                            Stock: {product.stock_quantity} {product.unit}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          product.is_available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {product.is_available ? "Available" : "Hidden"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-10">
                  <p className="mb-2 text-base">No products yet</p>
                  <p>Add your first SKU using the form on the right.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookPlus className="h-5 w-5 text-green-600" />
                Add new product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Product name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Organic Alphonso Mango"
                    value={form.name}
                    onChange={handleChange("name")}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Short description visible to customers"
                    className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      value={form.price}
                      onChange={handleChange("price")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Original price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.originalPrice}
                      onChange={handleChange("originalPrice")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Stock qty
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={form.stock}
                      onChange={handleChange("stock")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Min order
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={form.minOrder}
                      onChange={handleChange("minOrder")}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Max order
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={form.maxOrder}
                      onChange={handleChange("maxOrder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Unit
                    </label>
                    <Input
                      value={form.unit}
                      onChange={handleChange("unit")}
                      placeholder="kg, L, pcs…"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Category
                    </label>
                    <Select
                      value={form.categoryId || undefined}
                      onValueChange={(value) =>
                        setForm((prev) => ({ ...prev, categoryId: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags (comma separated)
                  </label>
                  <Input
                    value={form.tags}
                    onChange={handleChange("tags")}
                    placeholder="organic, bestseller, breakfast"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Image URLs (comma separated)
                  </label>
                  <Input
                    value={form.images}
                    onChange={handleChange("images")}
                    placeholder="https://..., https://..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader />
                      Creating…
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add product
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Use descriptive names so customers can find products via search.</p>
              <p>Keep stock updated—the storefront auto-hides products when stock reaches zero.</p>
              <p>Tags power AI recommendations. Think in customer intent: “keto”, “school tiffin”, “winter care”.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Loader({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Package className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
}

