"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryGrid } from "@/components/categories/CategoryGrid";
import { CategoryProducts } from "@/components/categories/CategoryProducts";
import { Loader2, Grid2x2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";

function CategoryPageContent() {
  const location = useStore((state) => state.location);
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get("categoryId");
  const categoryNameParam = searchParams.get("category");

  // Get all categories to find the selected one
  const allCategories = useQuery(api.categories.getAllCategories, {
    is_active: true,
  });

  // Find selected category
  const selectedCategoryId = useMemo(() => {
    if (categoryIdParam) {
      return categoryIdParam as Id<"categories">;
    }
    if (categoryNameParam && allCategories) {
      const foundCategory = allCategories.find(
        (cat) => cat.name.toLowerCase() === categoryNameParam.toLowerCase()
      );
      if (foundCategory) {
        return foundCategory._id;
      }
    }
    return null;
  }, [categoryIdParam, categoryNameParam, allCategories]);

  const selectedCategory = useQuery(
    api.categories.getCategory,
    selectedCategoryId ? { id: selectedCategoryId } : "skip"
  );

  const clearCategory = () => {
    window.history.pushState({}, "", "/category");
  };

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 font-montserrat">
                {selectedCategory ? selectedCategory.name : "Browse Categories"}
              </h1>
              <p className="text-muted-foreground">
                {selectedCategory
                  ? `Explore products in ${selectedCategory.name}`
                  : `Explore products by category${location?.city ? ` in ${location.city}` : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedCategory && (
                <Button
                  variant="outline"
                  onClick={clearCategory}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filter
                </Button>
              )}
              <Link href="/shops">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Grid2x2 className="h-4 w-4 mr-2" />
                  View All Shops
                </Button>
              </Link>
            </div>
          </div>

          {/* Selected Category Badge */}
          {selectedCategory && (
            <div className="mb-6">
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {selectedCategory.name}
                {selectedCategory.description && (
                  <span className="ml-2 text-muted-foreground">
                    - {selectedCategory.description}
                  </span>
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Show Products if category is selected, otherwise show category grid */}
        {selectedCategoryId ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <CategoryProducts categoryId={selectedCategoryId} limit={20} showTitle={false} />
          </Suspense>
        ) : (
          <>
            {/* Category Grid */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              }
            >
              <CategoryGrid showShopCount={true} columns={3} />
            </Suspense>

            {/* Show featured products from top categories */}
            {allCategories && (
              <div className="mt-12 sm:mt-16">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 font-montserrat">
                  Featured Products by Category
                </h2>
                <div className="space-y-12">
                  {allCategories
                    .filter((cat) => !cat.parent_id && cat.name.toLowerCase() !== "all")
                    .slice(0, 4)
                    .map((category) => (
                      <Suspense key={category._id} fallback={<div className="h-48" />}>
                        <CategoryProducts
                          categoryId={category._id}
                          limit={5}
                          showTitle={true}
                        />
                      </Suspense>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer CTA */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-border">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-muted-foreground mb-6">
              Explore all shops or register your own shop to serve the community
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/shops">
                <Button variant="default" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Grid2x2 className="h-4 w-4 mr-2" />
                  View All Shops
                </Button>
              </Link>
              <Link href="/shopkeeper/signup">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Register Your Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}

