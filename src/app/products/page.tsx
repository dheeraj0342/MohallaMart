"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Loader2, ShoppingBag, Filter, ChevronDown } from "lucide-react";
import CategoryFilterDropdown from "@/components/CategoryFilterDropdown";
import { ZeptoCard } from "@/components/products/ZeptoCard";
import type { Product } from "@/components/products/ZeptoCard";
import type { Id } from "@convex/_generated/dataModel";

const ITEMS_PER_PAGE = 12;

interface LatLng {
  lat: number;
  lng: number;
}

function calculateDistanceKm(pointA: LatLng, pointB: LatLng): number {
  const R = 6371;
  const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
  const dLng = ((pointB.lng - pointA.lng) * Math.PI) / 180;
  const lat1 = (pointA.lat * Math.PI) / 180;
  const lat2 = (pointB.lat * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { location, user } = useStore();
  
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "newest">("rating");
  const [page, setPage] = useState(1);
  const categoryParam = searchParams.get("category");
  const categoryIdParam = searchParams.get("categoryId");

  // Get all products
  const allProducts = useQuery(api.products.getAllProducts, {});

  // Get all categories
  const allCategories = useQuery(api.categories.getAllCategories, {
    is_active: true,
  });

  // Get cart items count
  const cartItems = useQuery(api.cart.getCart, user?.id ? { user_id: user.id as Id<"users"> } : "skip");

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

    // Filter by category if specified
    if (categoryParam && allCategories) {
      const selectedCategory = allCategories.find(
        (cat) => cat.name === categoryParam
      );
      if (selectedCategory?._id) {
        filtered = filtered.filter((p) => p.category_id === selectedCategory._id);
      }
    }

    // Filter by location (nearby products)
    if (location) {
      const userLat = (location as any)?.coordinates?.lat ?? (location as any)?.lat;
      const userLng = (location as any)?.coordinates?.lng ?? (location as any)?.lon;

      if (userLat && userLng) {
        filtered = filtered.filter((product) => {
          if (!product.shop_id) return true;
          // This is a simplified filter - you may want to enhance with shop location data
          return true;
        });
      }
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
        default:
          return 0;
      }
    });

    return sorted;
  }, [allProducts, allCategories, categoryParam, sortBy, location]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, page]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

  const handleAddToCart = (product: Product) => {
    // This would typically trigger a toast and update the cart
    // Implementation depends on your cart system
    console.log("Added to cart:", product.name);
  };

  const handleCategoryChange = (category: { name: string; _id: string }) => {
    const params = new URLSearchParams();
    params.set("category", category.name);
    params.set("categoryId", category._id);
    router.push(`/products?${params.toString()}`);
    setPage(1);
  };

  const handleClearFilters = () => {
    router.push("/products");
    setPage(1);
  };

  if (!allProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground poppins-semibold">All Products</h1>
                <p className="text-sm text-muted-foreground inter-regular">
                  {filteredAndSortedProducts.length} products available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <CategoryFilterDropdown
                onCategorySelect={handleCategoryChange}
                selectedCategory={categoryParam || "All Categories"}
              />
              {categoryParam && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground inter-regular">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm cursor-pointer appearance-none pr-8 inter-regular"
                >
                  <option value="rating">Rating (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {filteredAndSortedProducts.length === 0 ? (
          <Card className="border-border bg-card border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <Package className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground text-lg poppins-semibold">
                    No products found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 inter-regular">
                    {categoryParam
                      ? `No products available in "${categoryParam}"`
                      : "No products available right now"}
                  </p>
                </div>
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedProducts.map((product) => (
                <ZeptoCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  href={`/pd/${product._id}/${product.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-muted-foreground">...</span>}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
