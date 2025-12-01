"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, MapPin, Package, CheckCircle, Navigation, ShoppingBag, Truck } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Id } from "@/../../convex/_generated/dataModel";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function RiderAppPage() {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [riderProfileId, setRiderProfileId] = useState<Id<"riders"> | null>(null);

  // Get rider profile by user ID
  const riderProfile = useQuery(
    api.riders.getByUserId,
    user ? { user_id: user.id as Id<"users"> } : "skip"
  ) as {
    _id: Id<"riders">;
    name: string;
    phone: string;
    current_location: { lat: number; lon: number };
    is_online: boolean;
    is_busy: boolean;
    assigned_order_id?: Id<"orders">;
  } | null | undefined;

  const assignedOrder = riderProfile?.assigned_order_id
    ? useQuery(api.orders.getOrder, { id: riderProfile.assigned_order_id })
    : null;

  const updateStatus = useMutation(api.riders.updateStatus);
  const updateLocation = useMutation(api.riders.updateLocation);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  useEffect(() => {
    if (riderProfile) {
      setRiderProfileId(riderProfile._id);
      setIsOnline(riderProfile.is_online);
    }
  }, [riderProfile]);

  // Auto-update location every 5-10 seconds when online
  // Updates both Convex (for persistence) and WebSocket API (for real-time broadcasting)
  useEffect(() => {
    if (!isOnline || !riderProfileId) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          // Update Convex (persistent storage)
          try {
            await updateLocation({
              id: riderProfileId,
              location,
            });
          } catch (err) {
            console.error("Failed to update location in Convex:", err);
          }

          // Also send to WebSocket API for real-time broadcasting
          try {
            await fetch("/api/ws/rider", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                riderId: riderProfileId,
                lat: location.lat,
                lon: location.lon,
              }),
            });
          } catch (err) {
            console.error("Failed to broadcast location:", err);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isOnline, riderProfileId, updateLocation]);

  const handleToggleOnline = async () => {
    if (!riderProfileId) return;

    try {
      await updateStatus({
        id: riderProfileId,
        isOnline: !isOnline,
      });
      setIsOnline(!isOnline);
      success(isOnline ? "You are now offline" : "You are now online");
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  const handleStartPickup = async () => {
    if (!assignedOrder) return;

    try {
      // Status should already be "assigned_to_rider" from shopkeeper
      // This button confirms rider is starting pickup
      success("Starting pickup...");
    } catch (err: any) {
      error(err.message || "Failed to start pickup");
    }
  };

  const handlePickedFromShop = async () => {
    if (!assignedOrder) return;

    try {
      // Rider has picked up from shop, now out for delivery
      await updateOrderStatus({
        id: assignedOrder._id,
        status: "out_for_delivery",
      });
      success("Order picked up! Now out for delivery");
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  const handleDelivered = async () => {
    if (!assignedOrder || !riderProfileId) return;

    try {
      await updateOrderStatus({
        id: assignedOrder._id,
        status: "delivered",
      });

      // Mark rider as available (handled in updateOrderStatus mutation)
      success("Order delivered successfully!");
    } catch (err: any) {
      error(err.message || "Failed to mark as delivered");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please login to continue
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/rider/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (riderProfile === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!riderProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Rider profile not found. Please contact admin to create your rider profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Rider Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{riderProfile.name}</p>
                <p className="text-sm text-muted-foreground">{riderProfile.phone}</p>
              </div>
              <Button
                onClick={handleToggleOnline}
                variant={isOnline ? "default" : "outline"}
              >
                {isOnline ? "Online" : "Offline"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Order */}
        {assignedOrder ? (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Package className="h-5 w-5" />
                Assigned Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-foreground">Order #{assignedOrder.order_number}</p>
                <Badge variant="outline" className="mt-2">
                  {assignedOrder.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Items:</p>
                <div className="space-y-1">
                  {assignedOrder.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-1">Delivery Address:</p>
                <p className="text-sm text-muted-foreground">
                  {assignedOrder.delivery_address.street}, {assignedOrder.delivery_address.city}, {assignedOrder.delivery_address.pincode}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {assignedOrder.status === "assigned_to_rider" && (
                  <>
                    <Button onClick={handleStartPickup} className="w-full" variant="outline">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Start Pickup
                    </Button>
                    <Button onClick={handlePickedFromShop} className="w-full">
                      <Truck className="h-4 w-4 mr-2" />
                      Picked from Shop
                    </Button>
                  </>
                )}
                {assignedOrder.status === "out_for_delivery" && (
                  <Button onClick={handleDelivered} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href={`/track/${assignedOrder._id}`} target="_blank">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-foreground">No assigned orders</p>
              <p className="text-sm text-muted-foreground mt-2">
                You will be notified when an order is assigned by a shopkeeper
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
