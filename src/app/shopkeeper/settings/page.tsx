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
import { Loader2, Save, MapPin, Settings, PlusCircle } from "lucide-react";
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
    delivery_zones?: Array<{
      name: string;
      min_distance: number;
      max_distance: number;
      delivery_fee: number;
      min_order_value?: number;
    }>;
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
  const [deliveryZones, setDeliveryZones] = useState(
    shop?.delivery_zones || []
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
        delivery_zones: deliveryZones,
      });
      success("Settings saved successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      error(message);
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>Configure delivery fees based on distance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryZones.map((zone, index) => (
                  <div key={index} className="grid sm:grid-cols-4 gap-4 items-end border p-4 rounded-lg">
                    <div className="sm:col-span-1">
                      <Label className="text-xs mb-1.5 block">Zone Name</Label>
                      <Input
                        value={zone.name}
                        onChange={(e) => {
                          const newZones = [...deliveryZones];
                          newZones[index].name = e.target.value;
                          setDeliveryZones(newZones);
                        }}
                        placeholder="e.g. Zone A"
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Label className="text-xs mb-1.5 block">Distance Range (km)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={zone.min_distance}
                          onChange={(e) => {
                            const newZones = [...deliveryZones];
                            newZones[index].min_distance = Number(e.target.value);
                            setDeliveryZones(newZones);
                          }}
                          placeholder="Min"
                          className="h-9"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          value={zone.max_distance}
                          onChange={(e) => {
                            const newZones = [...deliveryZones];
                            newZones[index].max_distance = Number(e.target.value);
                            setDeliveryZones(newZones);
                          }}
                          placeholder="Max"
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <Label className="text-xs mb-1.5 block">Delivery Fee (₹)</Label>
                      <Input
                        type="number"
                        value={zone.delivery_fee}
                        onChange={(e) => {
                          const newZones = [...deliveryZones];
                          newZones[index].delivery_fee = Number(e.target.value);
                          setDeliveryZones(newZones);
                        }}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newZones = deliveryZones.filter((_, i) => i !== index);
                          setDeliveryZones(newZones);
                        }}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeliveryZones([
                      ...deliveryZones,
                      { name: "", min_distance: 0, max_distance: 5, delivery_fee: 0 },
                    ])
                  }
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Delivery Zone
                </Button>
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

