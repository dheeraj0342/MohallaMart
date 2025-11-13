"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import {
  Loader2,
  Navigation,
  Store as StoreIcon,
  Star,
  Compass,
  LocateFixed,
} from "lucide-react";
import { api } from "@/../convex/_generated/api";
import { useStore } from "@/store/useStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const shops = nearbyShops ?? [];
  const userCoordinates = location?.coordinates ?? null;

  return (
    <section className="border-t border-neutral-300 bg-neutral-50 py-16 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Compass className="h-6 w-6 text-green-600" /> Stores Near You
            </h2>
            <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Showing hyperlocal partners within {DELIVERY_RADIUS_KM} km
              {location?.pincode ? ` or PIN ${location.pincode}` : ""}.
            </p>
          </div>

          {location && (
            <div className="inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-100 px-4 py-1.5 text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300">
              <LocateFixed className="h-4 w-4" />
              <span className="text-sm font-medium">
                {location.area || location.city || "Location detected"}
              </span>
            </div>
          )}
        </div>

        {/* No location state */}
        {!hasLocation ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-300 bg-white p-10 text-center shadow-md dark:border-neutral-700 dark:bg-neutral-800">
            <Navigation className="h-14 w-14 text-green-600" />
            <div className="space-y-3 max-w-lg">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Share your location to explore local stores
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Tap the location picker in the navbar and allow access. We only use your
                coordinates to show stores that can reach you quickly.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            {/* Status Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Navigation className="h-4 w-4 text-green-600" />
                Showing partners closest to
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {location?.area || location?.city || "you"}
                </span>
              </div>

              {location?.pincode && (
                <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300 bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  PIN {location.pincode}
                </span>
              )}
            </div>

            {/* Stores Dropdown */}
            <div className="mt-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-yellow-100 px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-yellow-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600">
                    <span>
                      {isLoading
                        ? "Scanning nearby stores..."
                        : shops.length > 0
                        ? `Show ${shops.length} nearby store${shops.length > 1 ? "s" : ""}`
                        : "No stores found in your area"}
                    </span>
                    <StoreIcon className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="z-[9999] w-96 max-h-96 overflow-y-auto rounded-xl border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800">
                  {isLoading ? (
                    <div className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking for stores…
                    </div>
                  ) : shops.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      No active stores within {DELIVERY_RADIUS_KM} km. We&apos;re expanding soon!
                    </div>
                  ) : (
                    <>
                      <DropdownMenuLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        Nearby Stores
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-neutral-300 dark:bg-neutral-700" />

                      {shops.map((shop) => {
                        const coordinates = shop.address?.coordinates;
                        const distance =
                          coordinates && userCoordinates
                            ? calculateDistanceKm(userCoordinates, coordinates)
                            : null;

                        return (
                          <DropdownMenuItem
                            key={shop._id}
                            className="flex flex-col gap-1 rounded-lg px-4 py-3 text-neutral-900 hover:bg-yellow-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            onSelect={(e) => e.preventDefault()}
                          >
                            {/* Name + Distance */}
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{shop.name}</span>
                              {distance !== null && (
                                <span className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                                  <Navigation className="h-3 w-3" /> {distance.toFixed(1)} km
                                </span>
                              )}
                            </div>

                            {/* Address */}
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {shop.address?.street ? shop.address.street + ", " : ""}
                              {shop.address?.city || "City"}, {shop.address?.state}
                              {shop.address?.pincode ? ` · ${shop.address.pincode}` : ""}
                            </div>

                            {/* Rating + Orders */}
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                              {shop.rating ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                  <Star className="h-3 w-3" /> {shop.rating.toFixed(1)}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                  New partner
                                </span>
                              )}

                              {shop.total_orders && (
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {shop.total_orders.toLocaleString()}+ orders
                                </span>
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}