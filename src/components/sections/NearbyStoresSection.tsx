"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Loader2, MapPin, Navigation, Store as StoreIcon, Star } from "lucide-react";
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

type ShopLocation = {
  lat: number;
  lng: number;
};

type ShopRecord = {
  _id: string;
  name: string;
  description?: string | null;
  rating?: number | null;
  total_orders?: number | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    coordinates?: ShopLocation | null;
  };
};

type SearchShopsArgs = {
  query: string;
  city?: string;
  pincode?: string;
  customer_location?: ShopLocation;
  max_radius_km?: number;
  is_active?: boolean;
  limit?: number;
};

function calculateDistanceKm(pointA: ShopLocation, pointB: ShopLocation): number {
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

  const queryArgs = useMemo<SearchShopsArgs | "skip">(() => {
    if (!location) return "skip";

    const base: SearchShopsArgs = { query: "", is_active: true, limit: 24 };

    if (location.coordinates) {
      return {
        ...base,
        customer_location: {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
        },
        max_radius_km: DELIVERY_RADIUS_KM,
      };
    }

    if (location.pincode) {
      return { ...base, pincode: location.pincode };
    }

    return "skip";
  }, [location]);

  const nearbyShops = useQuery(
    api.shops.searchShops,
    queryArgs === "skip" ? "skip" : queryArgs,
  ) as ShopRecord[] | undefined;

  const isLoading = queryArgs !== "skip" && nearbyShops === undefined;
  const hasLocation = Boolean(location);
  const shops = (nearbyShops ?? []) as ShopRecord[];
  const userCoordinates = location?.coordinates ?? null;

  return (
    <section className="border-t border-[#e0e0e0] bg-[#f9f6f2] py-16 dark:border-[#2d333b] dark:bg-[#181c1f]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#212121] dark:text-[#f9f6f2]">Stores near you</h2>
            <p className="mt-2 max-w-2xl text-[#594a3a] dark:text-[#a2a6b2]">
              We highlight hyperlocal partners within a {DELIVERY_RADIUS_KM} km radius
              {location?.pincode ? ` or PIN ${location.pincode}` : ""} so deliveries stay fast.
            </p>
          </div>
          {location && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#a8d5bb] bg-[#e6f4ec] px-3 py-1.5 text-[#1f8f4e]">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">
                {location.area || location.city || "Detected location"}
              </span>
            </div>
          )}
        </div>

  {!hasLocation ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-[#e0e0e0] bg-white p-8 text-center dark:border-[#2d333b] dark:bg-[#24292e] md:flex-row md:items-start md:text-left">
            <Navigation className="h-12 w-12 text-[#27ae60]" />
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-[#212121] dark:text-[#f9f6f2]">
                Share your location to discover nearby stores
              </h3>
              <p className="text-sm leading-relaxed text-[#85786a] dark:text-[#a2a6b2]">
                Tap the location picker in the navbar and allow location access. We only use your position to surface
                partners that can reach you within minutes.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#2d333b] dark:bg-[#24292e]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-[#594a3a] dark:text-[#a2a6b2]">
                <Navigation className="h-4 w-4" />
                <span>
                  Showing partners closest to {location?.area || location?.city || "you"}.
                </span>
              </div>
              {location?.pincode && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#e0e0e0] bg-[#faffd2] px-3 py-1 text-xs font-medium text-[#3b2f22] dark:border-[#3b2f22] dark:bg-[#2d333b] dark:text-[#f9f6f2]">
                  PIN {location.pincode}
                </span>
              )}
            </div>

            <div className="mt-5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-[#e0e0e0] bg-[#faffd2] px-4 py-3 text-sm font-semibold text-[#3b2f22] transition-colors hover:bg-[#f0e88c] focus:outline-none focus:ring-2 focus:ring-[#27ae60] dark:border-[#3b2f22] dark:bg-[#2d333b] dark:text-[#f9f6f2] dark:hover:bg-[#3b2f22] dark:focus:ring-[#27ae60]"
                  >
                    <span>
                      {isLoading
                        ? "Checking nearby stores..."
                        : shops.length > 0
                        ? `Show ${shops.length} nearby store${shops.length > 1 ? "s" : ""}`
                        : "No active stores within range"}
                    </span>
                    <StoreIcon className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="z-9999 w-80 max-h-80 overflow-y-auto border border-[#e0e0e0] bg-white dark:border-[#2d333b] dark:bg-[#24292e]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-[#85786a] dark:text-[#a2a6b2]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scanning for partner stores…</span>
                    </div>
                  ) : shops.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-[#85786a] dark:text-[#a2a6b2]">
                      No active partners in a {DELIVERY_RADIUS_KM} km radius yet. We&apos;re expanding quickly!
                    </div>
                  ) : (
                    <>
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#85786a] dark:text-[#a2a6b2]">
                        Nearby partners
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#e0e0e0] dark:bg-[#2d333b]" />
                      {shops.map((shop) => {
                        const coordinates = shop.address?.coordinates ?? null;
                        const distanceKm =
                          coordinates && userCoordinates
                            ? calculateDistanceKm(userCoordinates, coordinates)
                            : null;

                        return (
                          <DropdownMenuItem
                            key={shop._id}
                            className="flex cursor-default flex-col items-start gap-1 rounded-lg px-3 py-2 text-left text-[#212121] transition-colors hover:bg-[#faffd2] dark:text-[#f9f6f2] dark:hover:bg-[#3b2f22]"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <div className="flex w-full items-center justify-between gap-3 text-sm font-semibold">
                              <span>{shop.name}</span>
                              {distanceKm !== null && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#594a3a] dark:text-[#a2a6b2]">
                                  <Navigation className="h-3 w-3" />
                                  {distanceKm.toFixed(1)} km
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#85786a] dark:text-[#a2a6b2]">
                              {shop.address?.street ? `${shop.address.street}, ` : ""}
                              {shop.address?.city || "City"}
                              {shop.address?.state ? `, ${shop.address.state}` : ""}
                              {shop.address?.pincode ? ` · ${shop.address.pincode}` : ""}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#594a3a] dark:text-[#f9f6f2]">
                              {shop.rating ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f4ec] px-2 py-0.5 text-[#1f8f4e]">
                                  <Star className="h-3 w-3" />
                                  {shop.rating.toFixed(1)}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-[#fff1eb] px-2 py-0.5 text-[#b83d0f]">
                                  New partner
                                </span>
                              )}
                              {shop.total_orders ? (
                                <span className="text-xs text-[#85786a] dark:text-[#a2a6b2]">
                                  {shop.total_orders.toLocaleString()}+ orders
                                </span>
                              ) : null}
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
