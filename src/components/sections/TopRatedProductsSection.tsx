"use client";

import { useEffect, useState } from "react";
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
import { ProductCard, type Product } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TopRatedProductsSection() {
  const { addToCart, location } = useStore();
  const { success } = useToast();
  const [sortBy, setSortBy] = useState<
    "rating" | "price_asc" | "price_desc" | "popular"
  >("rating");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Id<"categories"> | "all">("all");
  const [shopEtas, setShopEtas] = useState<Record<string, { minEta: number; maxEta: number }>>({});

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

  const isLoading = selectedCategory === "all" ? productsAll === undefined : productsByCategory === undefined;

  // Fetch ETAs for shops
  useEffect(() => {
    // Helper to safely access location coordinates
    const loc = location as unknown as { coordinates?: { lat: number; lng: number }; lat?: number; lon?: number } | null;
    const lat = loc?.coordinates?.lat ?? loc?.lat;
    const lng = loc?.coordinates?.lng ?? loc?.lon;

    if (!lat || !lng) return;

    const fetchEtas = async () => {
      try {
        const res = await fetch(`/api/vendors/nearby?userLat=${lat}&userLon=${lng}&radiusKm=10`);
        if (res.ok) {
          const data = await res.json();
          const etas: Record<string, { minEta: number; maxEta: number }> = {};
          if (data.vendors && Array.isArray(data.vendors)) {
            data.vendors.forEach((v: any) => {
              if (v.eta) {
                etas[v.id] = v.eta;
              }
            });
          }
          setShopEtas(etas);
        }
      } catch {
        // Silent error
      }
    };

    fetchEtas();
  }, [location]);

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

  const adaptProductForCard = (product: any): Product => {
    return {
      _id: (product._id ?? "") as string,
      name: product.name ?? "Unnamed product",
      price: typeof product.price === "number" ? product.price : 0,
      original_price:
        typeof product.original_price === "number" ? product.original_price : undefined,
      images: Array.isArray(product.images) ? product.images : [],
      description: product.description ?? "",
      stock_quantity:
        typeof product.stock_quantity === "number" ? product.stock_quantity : undefined,
      unit: product.unit ?? "unit",
      rating: typeof product.rating === "number" ? product.rating : undefined,
      min_order_quantity:
        typeof product.min_order_quantity === "number" ? product.min_order_quantity : 1,
      total_sales:
        typeof product.total_sales === "number" ? product.total_sales : undefined,
      is_featured: Boolean(product.is_featured),
      shop_id: product.shop_id ? String(product.shop_id) : undefined,
    };
  };
  const handleAddToCart = (product: Product) => {
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
    <section id="top-rated" className="pt-4 pb-16 sm:pt-2 sm:pb-8 bg-background">
      <div className="w-full max-w-7xl mx-auto bg-background text-foreground">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Top Rated Products</h2>
          </div>
          {!isLoading && limitedProducts && limitedProducts.length > 0 && (
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
            <label className="hidden sm:inline-flex items-center gap-2 text-sm">
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
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : limitedProducts && limitedProducts.length > 0 ? (
          <>
            {/* Mobile: horizontal scroll with 2 visible cards */}
            <div className="sm:hidden flex gap-4 overflow-x-auto no-scrollbar">
              {limitedProducts.map((product) => {
                const adaptedProduct = adaptProductForCard(product);
                return (
                  <div key={adaptedProduct._id} className="basis-1/2 shrink-0">
                    <ProductCard
                      product={adaptedProduct}
                      onAddToCart={handleAddToCart}
                      eta={adaptedProduct.shop_id ? shopEtas[adaptedProduct.shop_id] : undefined}
                    />
                  </div>
                );
              })}
            </div>
            {/* Desktop: grid */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {limitedProducts.map((product) => {
                const adaptedProduct = adaptProductForCard(product);
                return (
                  <ProductCard
                    key={adaptedProduct._id}
                    product={adaptedProduct}
                    onAddToCart={handleAddToCart}
                    eta={adaptedProduct.shop_id ? shopEtas[adaptedProduct.shop_id] : undefined}
                  />
                );
              })}
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
