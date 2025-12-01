"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";
import { Loader2, Save, MapPin, Settings } from "lucide-react";
import { useState } from "react";

export default function ShopkeeperSettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { _id?: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  ) as Array<{
    _id: Id<"shops">;
    name: string;
    radius_km?: number;
    delivery_profile?: {
      base_prep_minutes: number;
      max_parallel_orders: number;
      buffer_minutes: number;
      avg_rider_speed_kmph: number;
    };
  }> | null | undefined;

  const updateShop = useMutation(api.shops.updateShop);

  const shop = shops && shops.length > 0 ? shops[0] : null;

  const [radiusKm, setRadiusKm] = useState(shop?.radius_km || 2);
  const [basePrepMinutes, setBasePrepMinutes] = useState(
    shop?.delivery_profile?.base_prep_minutes || 5
  );
  const [maxParallelOrders, setMaxParallelOrders] = useState(
    shop?.delivery_profile?.max_parallel_orders || 3
  );
  const [bufferMinutes, setBufferMinutes] = useState(
    shop?.delivery_profile?.buffer_minutes || 5
  );
  const [avgRiderSpeed, setAvgRiderSpeed] = useState(
    shop?.delivery_profile?.avg_rider_speed_kmph || 20
  );

  const handleSave = async () => {
    if (!shop) {
      error("No shop found");
      return;
    }

    setIsSaving(true);
    try {
      await updateShop({
        id: shop._id,
        radius_km: radiusKm,
        delivery_profile: {
          base_prep_minutes: basePrepMinutes,
          max_parallel_orders: maxParallelOrders,
          buffer_minutes: bufferMinutes,
          avg_rider_speed_kmph: avgRiderSpeed,
        },
      });
      success("Settings saved successfully");
    } catch (err: any) {
      error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!shop) {
    return (
      <ShopkeeperGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ShopkeeperGuard>
    );
  }

  return (
    <ShopkeeperGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Shop Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your shop delivery settings</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Radius
              </CardTitle>
              <CardDescription>Set your delivery service radius</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="radius">Radius (km)</Label>
                  <Input
                    id="radius"
                    type="number"
                    min="1"
                    max="10"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Delivery Profile
              </CardTitle>
              <CardDescription>Configure your delivery time settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="basePrep">Base Prep Time (minutes)</Label>
                  <Input
                    id="basePrep"
                    type="number"
                    min="1"
                    value={basePrepMinutes}
                    onChange={(e) => setBasePrepMinutes(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxOrders">Max Parallel Orders</Label>
                  <Input
                    id="maxOrders"
                    type="number"
                    min="1"
                    max="10"
                    value={maxParallelOrders}
                    onChange={(e) => setMaxParallelOrders(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer"
                    type="number"
                    min="0"
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="speed">Avg Rider Speed (km/h)</Label>
                  <Input
                    id="speed"
                    type="number"
                    min="10"
                    max="50"
                    value={avgRiderSpeed}
                    onChange={(e) => setAvgRiderSpeed(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ShopkeeperGuard>
  );
}

