"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { LocationPicker, type AccurateLocation } from "@/components/location/LocationPicker";
import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ShopkeeperLocationPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<AccurateLocation | null>(null);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as
    | Array<{
        _id: Id<"shops">;
        name: string;
        location?: {
          lat: number;
          lon: number;
          accuracy: number;
          snapped: boolean;
          source: string;
          addressText: string;
          road?: string;
          suburb?: string;
          city?: string;
          postcode?: string;
        };
      }>
    | null
    | undefined;

  const shop = shops && shops.length > 0 ? shops[0] : null;

  const initialLocation: AccurateLocation | null =
    shop?.location != null
      ? {
          lat: shop.location.lat,
          lon: shop.location.lon,
          accuracy: shop.location.accuracy,
          snapped: shop.location.snapped,
          source: shop.location.source as AccurateLocation["source"],
          addressText: shop.location.addressText,
          road: shop.location.road,
          suburb: shop.location.suburb,
          city: shop.location.city,
          postcode: shop.location.postcode,
        }
      : null;

  const handleSave = async () => {
    if (!currentLocation || !shop) return;
    try {
      setSaving(true);
      const res = await fetch("/api/shopkeeper/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopId: shop._id,
          ...currentLocation,
        }),
      });
      if (!res.ok) {
        console.error("[ShopkeeperLocationPage] Failed to save location", await res.text());
      }
    } catch (err) {
      console.error("[ShopkeeperLocationPage] Error saving location", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !dbUser) {
    return (
      <ShopkeeperGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ShopkeeperGuard>
    );
  }

  if (!shop) {
    return (
      <ShopkeeperGuard>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="py-8 text-center space-y-2">
              <p className="font-semibold text-foreground">No active shop found</p>
              <p className="text-sm text-muted-foreground">
                Create a shop first before setting its accurate location.
              </p>
            </CardContent>
          </Card>
        </div>
      </ShopkeeperGuard>
    );
  }

  return (
    <ShopkeeperGuard>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shop Location</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Use high-accuracy GPS, snap to road, and drag the marker to set your shop&apos;s
              exact position.
            </p>
          </div>

          <LocationPicker
            initialLocation={initialLocation}
            onChange={(loc) => setCurrentLocation(loc)}
          />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || !currentLocation}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Location"
              )}
            </Button>
          </div>
        </div>
      </div>
    </ShopkeeperGuard>
  );
}


