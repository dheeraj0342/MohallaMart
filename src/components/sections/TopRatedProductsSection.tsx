"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { ZeptoCard, type Product } from "@/components/products/ZeptoCard";
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

  useEffect(() => {
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
      id: `${product._id}`,
      productId: product._id as Id<"products">,
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
    <section id="top-rated" className="py-12 sm:py-16 bg-muted/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-yellow-500/10">
                <Star className="h-4 w-4 text-yellow-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Top Rated Products</h2>
            </div>
            {!isLoading && limitedProducts && limitedProducts.length > 0 && (
              <p className="text-sm text-muted-foreground ml-10">
                {limitedProducts.length} highly rated products from local stores
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Category:</span>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as Id<"categories"> | "all")}
            >
              <SelectTrigger className="h-9 w-[140px] sm:w-[160px] text-sm" aria-label="Filter by category">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) &&
                  categories.map((c) => (
                    <SelectItem key={c._id} value={c._id as unknown as string}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="h-9 w-[140px] sm:w-[160px] text-sm" aria-label="Sort products">
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
          
          <label className="flex items-center gap-2 text-sm cursor-pointer ml-auto">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary rounded"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              aria-label="Show in-stock only"
            />
            <span className="text-muted-foreground">In stock only</span>
          </label>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-3 bg-card rounded-xl border border-border/30 p-3">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : limitedProducts && limitedProducts.length > 0 ? (
          <>
            <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {limitedProducts.map((product) => {
                const adaptedProduct = adaptProductForCard(product);
                return (
                  <div key={adaptedProduct._id} className="w-[165px] shrink-0 snap-start">
                    <ZeptoCard
                      product={adaptedProduct}
                      onAddToCart={handleAddToCart}
                      eta={adaptedProduct.shop_id ? shopEtas[adaptedProduct.shop_id] : undefined}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {limitedProducts.map((product) => {
                const adaptedProduct = adaptProductForCard(product);
                return (
                  <ZeptoCard
                    key={adaptedProduct._id}
                    product={adaptedProduct}
                    onAddToCart={handleAddToCart}
                    eta={adaptedProduct.shop_id ? shopEtas[adaptedProduct.shop_id] : undefined}
                  />
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link href="/products">
                <Button variant="outline" className="px-6 font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  View all products
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <Card className="border-border/30 bg-card/50 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/20">
                  <Package className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No Products Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Products will appear here once stores add their inventory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
