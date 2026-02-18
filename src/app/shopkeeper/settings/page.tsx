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
import { Loader2, Save, MapPin, Settings, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

type DeliveryZone = {
  name: string;
  min_distance: number;
  max_distance: number;
  delivery_fee: number;
  min_order_value?: number;
};

export default function ShopkeeperSettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [zoneErrors, setZoneErrors] = useState<string[]>([]);

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
    delivery_zones?: DeliveryZone[];
  }> | null | undefined;

  const updateShop = useMutation(api.shops.updateShop);

  const shop = shops && shops.length > 0 ? shops[0] : null;

  const [radiusKm, setRadiusKm] = useState(2);
  const [basePrepMinutes, setBasePrepMinutes] = useState(5);
  const [maxParallelOrders, setMaxParallelOrders] = useState(3);
  const [bufferMinutes, setBufferMinutes] = useState(5);
  const [avgRiderSpeed, setAvgRiderSpeed] = useState(20);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Sync state when shop data loads
  useEffect(() => {
    if (!shop) return;
    setRadiusKm(shop.radius_km ?? 2);
    setBasePrepMinutes(shop.delivery_profile?.base_prep_minutes ?? 5);
    setMaxParallelOrders(shop.delivery_profile?.max_parallel_orders ?? 3);
    setBufferMinutes(shop.delivery_profile?.buffer_minutes ?? 5);
    setAvgRiderSpeed(shop.delivery_profile?.avg_rider_speed_kmph ?? 20);
    setDeliveryZones(shop.delivery_zones ?? []);
  }, [shop?._id]); // run once when shop ID is first available

  const updateZone = (index: number, field: keyof DeliveryZone, value: string | number) => {
    setDeliveryZones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear errors when user edits
    if (zoneErrors.length > 0) setZoneErrors([]);
  };

  const removeZone = (index: number) => {
    setDeliveryZones((prev) => prev.filter((_, i) => i !== index));
    setZoneErrors([]);
  };

  const addZone = () => {
    const lastMax = deliveryZones.length > 0
      ? deliveryZones[deliveryZones.length - 1].max_distance
      : 0;
    setDeliveryZones((prev) => [
      ...prev,
      { name: `Zone ${prev.length + 1}`, min_distance: lastMax, max_distance: lastMax + 2, delivery_fee: 0 },
    ]);
  };

  const validateZones = (): string[] => {
    const errors: string[] = [];
    for (let i = 0; i < deliveryZones.length; i++) {
      const z = deliveryZones[i];
      if (!z.name.trim()) {
        errors.push(`Zone ${i + 1}: Name is required`);
      }
      if (z.min_distance < 0) {
        errors.push(`Zone ${i + 1}: Min distance cannot be negative`);
      }
      if (z.max_distance <= z.min_distance) {
        errors.push(`Zone ${i + 1}: Max distance must be greater than min distance`);
      }
      if (z.delivery_fee < 0) {
        errors.push(`Zone ${i + 1}: Delivery fee cannot be negative`);
      }
      if (z.min_order_value !== undefined && z.min_order_value < 0) {
        errors.push(`Zone ${i + 1}: Min order value cannot be negative`);
      }
    }
    return errors;
  };

  const handleSave = async () => {
    if (!shop) {
      error("No shop found");
      return;
    }

    const errors = validateZones();
    if (errors.length > 0) {
      setZoneErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      // Strip undefined min_order_value from zones before saving
      const zonesToSave = deliveryZones.map((z) => ({
        name: z.name.trim(),
        min_distance: z.min_distance,
        max_distance: z.max_distance,
        delivery_fee: z.delivery_fee,
        ...(z.min_order_value !== undefined && z.min_order_value > 0
          ? { min_order_value: z.min_order_value }
          : {}),
      }));

      await updateShop({
        id: shop._id,
        radius_km: radiusKm,
        delivery_profile: {
          base_prep_minutes: basePrepMinutes,
          max_parallel_orders: maxParallelOrders,
          buffer_minutes: bufferMinutes,
          avg_rider_speed_kmph: avgRiderSpeed,
        },
        delivery_zones: zonesToSave,
      });
      success("Settings saved successfully");
      setZoneErrors([]);
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
          {/* Delivery Radius */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Radius
              </CardTitle>
              <CardDescription>
                Maximum distance (km) from your shop that you will deliver to. Customers outside this radius cannot place orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="25"
                  step="0.5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {radiusKm} km from your shop
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Delivery Profile
              </CardTitle>
              <CardDescription>Configure delivery time calculations shown to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="basePrep">Base Prep Time (minutes)</Label>
                  <Input
                    id="basePrep"
                    type="number"
                    min="1"
                    value={basePrepMinutes}
                    onChange={(e) => setBasePrepMinutes(Number(e.target.value))}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Time to prepare a single order</p>
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
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Orders handled simultaneously</p>
                </div>
                <div>
                  <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer"
                    type="number"
                    min="0"
                    value={bufferMinutes}
                    onChange={(e) => setBufferMinutes(Number(e.target.value))}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Extra time added for delays</p>
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
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Average speed for ETA calculation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Zones
              </CardTitle>
              <CardDescription>
                Set distance-based delivery fees. Zones are matched by distance from your shop.
                If no zone matches, a flat ₹40 fee applies (free above ₹199).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Zone error summary */}
                {zoneErrors.length > 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <ul className="space-y-0.5">
                      {zoneErrors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {deliveryZones.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    No zones configured. A flat ₹40 delivery fee will apply (free above ₹199).
                  </p>
                )}

                {deliveryZones.map((zone, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Zone {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeZone(index)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Zone Name */}
                      <div className="sm:col-span-2">
                        <Label className="text-xs">Zone Name</Label>
                        <Input
                          value={zone.name}
                          onChange={(e) => updateZone(index, "name", e.target.value)}
                          placeholder="e.g. Nearby, Zone A, Far"
                          className="h-9 mt-1"
                        />
                      </div>

                      {/* Distance Range */}
                      <div>
                        <Label className="text-xs">Min Distance (km)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={zone.min_distance}
                          onChange={(e) => updateZone(index, "min_distance", Number(e.target.value))}
                          placeholder="0"
                          className="h-9 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Distance (km)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={zone.max_distance}
                          onChange={(e) => updateZone(index, "max_distance", Number(e.target.value))}
                          placeholder="5"
                          className="h-9 mt-1"
                        />
                      </div>

                      {/* Delivery Fee */}
                      <div>
                        <Label className="text-xs">Delivery Fee (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={zone.delivery_fee}
                          onChange={(e) => updateZone(index, "delivery_fee", Number(e.target.value))}
                          placeholder="0"
                          className="h-9 mt-1"
                        />
                      </div>

                      {/* Min Order Value */}
                      <div>
                        <Label className="text-xs">Min Order Value (₹) <span className="text-muted-foreground">(optional)</span></Label>
                        <Input
                          type="number"
                          min="0"
                          value={zone.min_order_value ?? ""}
                          onChange={(e) =>
                            updateZone(
                              index,
                              "min_order_value",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="No minimum"
                          className="h-9 mt-1"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Customers {zone.min_distance}–{zone.max_distance} km away pay ₹{zone.delivery_fee}
                      {zone.min_order_value && zone.min_order_value > 0
                        ? ` (min order ₹${zone.min_order_value})`
                        : ""}
                    </p>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addZone}
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
