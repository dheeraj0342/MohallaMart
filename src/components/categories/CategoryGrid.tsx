"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Grid2x2, Store } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store/useStore";
import { useMemo } from "react";

interface CategoryGridProps {
  showShopCount?: boolean;
  columns?: 2 | 3 | 4;
}

export function CategoryGrid({ showShopCount = true, columns = 3 }: CategoryGridProps) {
  const location = useStore((state) => state.location);
  const allCategories = useQuery(api.categories.getAllCategories, {
    is_active: true,
  });

  // Get all shops to count by category
  const allShops = useQuery(
    api.shops.searchShops,
    location
      ? {
        query: "",
        is_active: true,
        ...(location.coordinates && {
          customer_location: location.coordinates,
          max_radius_km: 10,
        }),
        ...(location.pincode && { pincode: location.pincode }),
        ...(location.city && { city: location.city }),
      }
      : { query: "", is_active: true },
  );

  // Filter out "All" category and get root categories only
  const rootCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories
      .filter((cat) => !cat.parent_id && cat.name.toLowerCase() !== "all")
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [allCategories]);

  // Count shops per category
  const shopsByCategory = useMemo(() => {
    if (!allShops || !rootCategories) return new Map();
    const map = new Map();
    rootCategories.forEach((cat) => {
      const count = allShops.filter(
        (shop) => shop.categories?.includes(cat._id),
      ).length;
      map.set(cat._id, count);
    });
    return map;
  }, [allShops, rootCategories]);

  if (allCategories === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
      {rootCategories.map((category) => {
        const shopCount = shopsByCategory.get(category._id) || 0;
        return (
          <Link
            key={category._id}
            href={`/category?category=${encodeURIComponent(category.name)}&categoryId=${category._id}`}
            className="group"
          >
            <Card className="h-full border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Grid2x2 className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {showShopCount && shopCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute top-3 right-3 bg-background/90 text-foreground border-border"
                    >
                      <Store className="h-3 w-3 mr-1" />
                      {shopCount} {shopCount === 1 ? "shop" : "shops"}
                    </Badge>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  {!showShopCount && shopCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {shopCount} {shopCount === 1 ? "shop" : "shops"} available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

