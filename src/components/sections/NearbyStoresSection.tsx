"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import Link from "next/link";
import {
  Loader2,
  Navigation,
  Store as StoreIcon,
  Star,
  Compass,
  LocateFixed,
  MapPin,
  Package,
  ArrowRight,
} from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/utils";
import Image from "next/image";

const DELIVERY_RADIUS_KM = 2;

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

export default function NearbyStoresSection() {
  const { location } = useStore();

  // Prepare API arguments
  const queryArgs = useMemo(() => {
    if (!location) return "skip";

    const base = { query: "", is_active: true, limit: 24 };

    if (location.coordinates) {
      return {
        ...base,
        customer_location: location.coordinates,
        max_radius_km: DELIVERY_RADIUS_KM,
      };
    }

    if (location.pincode) return { ...base, pincode: location.pincode };
    return "skip";
  }, [location]);

  const nearbyShops = useQuery(
    api.shops.searchShops,
    queryArgs === "skip" ? "skip" : queryArgs
  );

  const isLoading = queryArgs !== "skip" && nearbyShops === undefined;
  const hasLocation = Boolean(location);
  const userCoordinates = location?.coordinates ?? null;

  // Sort shops by distance (if available) or rating
  const sortedShops = useMemo(() => {
    const shops = (nearbyShops ?? []) as Array<{
      _id: string;
      name: string;
      description?: string;
      logo_url?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        coordinates?: { lat: number; lng: number };
      };
      rating?: number;
      total_orders?: number;
      is_active?: boolean;
    }>;

    if (!userCoordinates) return shops;
    return [...shops].sort((a, b) => {
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
  }, [nearbyShops, userCoordinates]);

  return (
    <section className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" /> Stores Near You
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Showing hyperlocal partners within {DELIVERY_RADIUS_KM} km
              {location?.pincode ? ` or PIN ${location.pincode}` : ""}.
            </p>
          </div>

          {location && (
            <Badge className="inline-flex items-center gap-2 bg-[var(--success-bg-light)] text-[var(--success-fg)] border-[var(--success-border)]">
              <LocateFixed className="h-4 w-4" />
              <span className="text-sm font-medium">
                {location.area || location.city || "Location detected"}
              </span>
            </Badge>
          )}
        </div>

        {/* No location state */}
        {!hasLocation ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
            <Navigation className="h-14 w-14 text-primary" />
            <div className="space-y-3 max-w-lg">
              <h3 className="text-xl font-semibold">
                Share your location to explore local stores
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tap the location picker in the navbar and allow access. We only use your
                coordinates to show stores that can reach you quickly.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Status Bar */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4 text-primary" />
                <span>
                  Showing {isLoading ? "..." : sortedShops.length} store{sortedShops.length !== 1 ? "s" : ""} near
                  <span className="font-semibold ml-1">
                    {location?.area || location?.city || "you"}
                  </span>
                </span>
              </div>

              {location?.pincode && (
                <Badge variant="outline" className="bg-[var(--warning-bg-light)] text-[var(--warning-fg)] border-[var(--warning-border)]">
                  PIN {location.pincode}
                </Badge>
              )}
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Scanning nearby stores...</p>
              </div>
            ) : sortedShops.length === 0 ? (
              <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 text-center">
                <StoreIcon className="h-14 w-14 text-neutral-400 dark:text-neutral-500" />
                <div className="space-y-2 max-w-lg">
                  <h3 className="text-xl font-semibold">
                    No stores found in your area
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We couldn&apos;t find any active stores within {DELIVERY_RADIUS_KM} km.
                    We&apos;re expanding to new areas soon!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedShops.map((shop) => {
                  const coordinates = shop.address?.coordinates;
                  const distance =
                    coordinates && userCoordinates
                      ? calculateDistanceKm(userCoordinates, coordinates)
                      : null;

                  return (
                    <Card
                      key={shop._id}
                      className="group hover:shadow-lg transition-shadow border-border bg-card"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          {shop.logo_url ? (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                              <Image
                                src={shop.logo_url}
                                alt={shop.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized={shop.logo_url.includes("convex.cloud")}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <StoreIcon className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                              {shop.name}
                            </CardTitle>
                            {shop.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {shop.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Address */}
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="text-muted-foreground min-w-0">
                            {shop.address?.street && (
                              <p className="line-clamp-1">{shop.address.street}</p>
                            )}
                            <p className="text-xs">
                              {shop.address?.city || "City"}
                              {shop.address?.state && `, ${shop.address.state}`}
                              {shop.address?.pincode && ` ${shop.address.pincode}`}
                            </p>
                          </div>
                        </div>

                        {/* Distance */}
                        {distance !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Navigation className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">
                              {distance.toFixed(1)} km away
                            </span>
                          </div>
                        )}

                        {/* Rating & Orders */}
                        <div className="flex items-center gap-3 pt-2 border-t border-border">
                          {shop.rating ? (
                            <Badge variant="secondary" className="bg-[var(--success-bg-light)] text-[var(--success-fg)]">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              {shop.rating.toFixed(1)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-[var(--warning-bg-light)] text-[var(--warning-fg)]">
                              New
                            </Badge>
                          )}

                          {shop.total_orders !== undefined && shop.total_orders > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Package className="h-3 w-3" />
                              <span>{shop.total_orders.toLocaleString()}+ orders</span>
                            </div>
                          )}
                        </div>

                        {/* View Shop Button */}
                        <Button
                          asChild
                          variant="outline"
                          className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <Link href={`/shop/${generateSlug(shop.name)}`}>
                            View Shop
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
