"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Package, Star } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/../convex/_generated/dataModel";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/useToast";
import ShopProductCard from "@/components/products/ShopCard";

export default function TopRatedProductsSection() {
  const { addToCart } = useStore();
  const { success } = useToast();
  const [sortBy, setSortBy] = useState<
    "rating" | "price_asc" | "price_desc" | "popular"
  >("rating");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | "all">("all");
  const categories = useQuery(api.categories.getRootCategories, { is_active: true }) as
    | Array<{ _id: Id<"categories">; name: string }>
    | null
    | undefined;
  const productsAll = useQuery(api.products.searchProducts, {
    query: "",
    is_available: true,
  });
  const productsByCategory = useQuery(
    api.products.getProductsByCategory,
    selectedCategory !== "all"
      ? ({ category_id: selectedCategory as Id<"categories">, is_available: true } as {
        category_id: Id<"categories">;
        is_available: boolean;
      })
      : ("skip" as const),
  );
  const baseProducts =
    selectedCategory === "all"
      ? (Array.isArray(productsAll) ? productsAll : [])
      : (Array.isArray(productsByCategory) ? productsByCategory : []);

  const sortedProducts = Array.isArray(baseProducts)
    ? [...baseProducts].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price_desc":
          return (b.price ?? 0) - (a.price ?? 0);
        case "popular":
          return (b.total_sales ?? 0) - (a.total_sales ?? 0);
        case "rating":
        default:
          return (b.rating ?? 0) - (a.rating ?? 0);
      }
    })
    : [];
  const displayProducts = inStockOnly
    ? sortedProducts.filter(
      (p) => typeof p.stock_quantity === "number" && p.stock_quantity > 0
    )
    : sortedProducts;
  const limitedProducts = displayProducts.slice(0, 8);
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: `${product.name} (${product.unit})`,
      price: product.price,
      ...(product.images && product.images.length > 0 && {
        image: product.images[0],
      }),
      quantity: product.min_order_quantity,
    });
    success(`${product.name} added to cart!`);
  };
  return (
    <section id="top-rated" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Top Rated Products</h2>
          </div>
          {limitedProducts && limitedProducts.length > 0 && (
            <Badge variant="outline" className="text-sm">
              {limitedProducts.length} {limitedProducts.length === 1 ? "Product" : "Products"}
            </Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Separator className="hidden sm:block flex-1" />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-64">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Category</span>
              <Select
                value={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v as Id<"categories"> | "all")}
              >
                <SelectTrigger size="sm" aria-label="Filter by category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Array.isArray(categories) &&
                    categories.map((c) => (
                      <SelectItem key={c._id} value={c._id as unknown as string}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                aria-label="Show in-stock only"
              />
              In-stock only
            </label>
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger size="sm" aria-label="Sort products" className="w-full sm:w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {limitedProducts && limitedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {limitedProducts.map((product) => (
                <ShopProductCard
                  key={product._id}
                  product={product as any}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Link href="/shops">
                <Button variant="outline">View all products</Button>
              </Link>
            </div>
          </>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Products Available
              </h3>
              <p className="text-sm text-muted-foreground">
                No products to display yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
