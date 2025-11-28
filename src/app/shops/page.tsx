"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, MapPin, Star, Package, Loader2, Navigation, ShoppingBag, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { generateSlug } from "@/lib/utils";
import CategoryFilterDropdown from "@/components/CategoryFilterDropdown";
import type { Id } from "@/../convex/_generated/dataModel";

const DELIVERY_RADIUS_KM = 10; // Increased radius for shop listing page

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

export default function ShopsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get("category");
  const categoryIdParam = searchParams.get("categoryId");
  const location = useStore((state) => state.location);

  // Find category by name if categoryParam exists
  const allCategories = useQuery(api.categories.getAllCategories, {
    is_active: true,
  });

  // Get category ID from name or use categoryIdParam
  const resolvedCategoryId = useMemo(() => {
    if (categoryIdParam) {
      return categoryIdParam as Id<"categories">;
    }
    if (categoryParam && allCategories) {
      const foundCategory = allCategories.find(
        (cat) => cat.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (foundCategory) {
        return foundCategory._id;
      }
    }
    return "all";
  }, [categoryParam, categoryIdParam, allCategories]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    Id<"categories"> | "all"
  >(resolvedCategoryId);

  // Update selectedCategoryId when resolvedCategoryId changes
  useEffect(() => {
    if (resolvedCategoryId !== selectedCategoryId) {
      setSelectedCategoryId(resolvedCategoryId);
    }
  }, [resolvedCategoryId, selectedCategoryId]);

  // Get selected category details
  const selectedCategory = useQuery(
    api.categories.getCategory,
    selectedCategoryId && selectedCategoryId !== "all"
      ? { id: selectedCategoryId as Id<"categories"> }
      : "skip",
  );

  // Prepare API arguments for getShopsByCategory (supports both category_id and category_name)
  const categoryQueryArgs = useMemo(() => {
    const base: {
      category_id?: Id<"categories">;
      category_name?: string;
      city?: string;
      pincode?: string;
      is_active: boolean;
    } = {
      is_active: true,
    };

    if (selectedCategoryId && selectedCategoryId !== "all") {
      // If we have categoryId, use it
      base.category_id = selectedCategoryId as Id<"categories">;
    } else if (categoryParam && categoryParam.toLowerCase() !== "all") {
      // Otherwise, use category name
      base.category_name = categoryParam;
    }

    // Add location filters
    if (location?.city) {
      base.city = location.city;
    }
    if (location?.pincode) {
      base.pincode = location.pincode;
    }

    return base;
  }, [selectedCategoryId, categoryParam, location]);

  // Prepare API arguments for searchShops (when no category selected)
  const searchQueryArgs = useMemo(() => {
    if (!location) {
      return { query: "", is_active: true };
    }

    const base = { query: "", is_active: true };

    if (location.coordinates) {
      return {
        ...base,
        customer_location: location.coordinates,
        max_radius_km: DELIVERY_RADIUS_KM,
      };
    }

    if (location.pincode) {
      return { ...base, pincode: location.pincode };
    }

    if (location.city) {
      return { ...base, city: location.city };
    }

    return base;
  }, [location]);

  // Use getShopsByCategory if category is selected, otherwise use searchShops
  const allShops = useQuery(
    (selectedCategoryId && selectedCategoryId !== "all") || categoryParam
      ? api.shops.getShopsByCategory
      : api.shops.searchShops,
    (selectedCategoryId && selectedCategoryId !== "all") || categoryParam
      ? categoryQueryArgs
      : searchQueryArgs,
  );

  const userCoordinates = location?.coordinates ?? null;

  // Sort by distance/rating
  const shops = useMemo(() => {
    if (!allShops) return [];

    const filtered = [...allShops];

    // Sort by distance (if available) or rating
    if (userCoordinates) {
      filtered.sort((a, b) => {
        const aCoords = a.address?.coordinates;
        const bCoords = b.address?.coordinates;

        if (aCoords && bCoords) {
          const distA = calculateDistanceKm(userCoordinates, aCoords);
          const distB = calculateDistanceKm(userCoordinates, bCoords);
          return distA - distB;
        }
        if (aCoords) return -1;
        if (bCoords) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      // Sort by rating if no coordinates
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [allShops, userCoordinates]);

  const handleCategoryChange = (categoryId: Id<"categories"> | "all") => {
    setSelectedCategoryId(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId && categoryId !== "all") {
      params.set("categoryId", categoryId);
    } else {
      params.delete("categoryId");
      params.delete("category");
    }
    router.push(`/shops?${params.toString()}`);
  };

  if (allShops === undefined) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                All Shops
              </h1>
              <p className="text-muted-foreground">
                {shops.length} {shops.length === 1 ? "shop" : "shops"} found
                {location && ` in ${location.city}`}
              </p>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[250px]">
              <CategoryFilterDropdown
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                label="Filter by Category"
                placeholder="All Categories"
                showAllOption
              />
            </div>
          </div>
        </div>

        {shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.map((shop) => {
              const coordinates = shop.address?.coordinates;
              const distance =
                coordinates && userCoordinates
                  ? calculateDistanceKm(userCoordinates, coordinates)
                  : null;

              return (
                <Link
                  key={shop._id}
                  href={`/shop/${generateSlug(shop.name)}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-border bg-card overflow-hidden">
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      {shop.logo_url ? (
                        <Image
                          src={shop.logo_url}
                          alt={shop.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          unoptimized={shop.logo_url.includes("convex.cloud")}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Store className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {shop.rating && shop.rating > 0 && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {shop.rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {shop.name}
                      </h3>
                      {shop.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {shop.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {shop.address.city}, {shop.address.state}
                        </span>
                      </div>

                      {/* Distance */}
                      {distance !== null && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Navigation className="h-3 w-3 text-primary" />
                          <span>{distance.toFixed(1)} km away</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="h-3 w-3" />
                          <span>{shop.total_orders || 0} orders</span>
                        </div>
                        {shop.is_active && (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border-border bg-card overflow-hidden">
            <CardContent className="py-16 px-6">
              <div className="max-w-2xl mx-auto text-center">
                {/* Icon with gradient background */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                  <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedCategoryId && selectedCategoryId !== "all" ? (
                      <ShoppingBag className="h-12 w-12 text-primary" />
                    ) : (
                      <Store className="h-12 w-12 text-primary" />
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 font-montserrat">
                  {selectedCategoryId && selectedCategoryId !== "all" && selectedCategory
                    ? `No ${selectedCategory.name} Shops Available Yet`
                    : "No Shops Available"}
                </h2>

                {/* Message */}
                <div className="space-y-4 mb-8">
                  {selectedCategoryId && selectedCategoryId !== "all" && selectedCategory ? (
                    <>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        We&apos;re working on adding more{" "}
                        <span className="font-semibold text-primary">
                          {selectedCategory.name}
                        </span>{" "}
                        shops to serve you better!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        New shops are being added regularly. Check back soon or explore other categories.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        We&apos;re currently setting up shops in your area.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        New shops are being added regularly. Check back soon!
                      </p>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  {selectedCategoryId && selectedCategoryId !== "all" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCategoryChange("all")}
                      className="w-full sm:w-auto"
                    >
                      <Store className="h-4 w-4 mr-2" />
                      View All Shops
                    </Button>
                  )}
                  <Button
                    variant="default"
                    onClick={() => router.push("/")}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explore Home
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>We&apos;ll notify you when new shops are available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

