"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Loader2, MapPin, Package, CheckCircle, Navigation } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../../convex/_generated/api";

export default function RiderAppPage() {
  const { success, error } = useToast();
  const [riderId, setRiderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  // Get rider data (TODO: Implement rider authentication)
  const rider = riderId ? useQuery(api.riders.getById, { id: riderId as any }) : null;
  const assignedOrder = rider?.assigned_order_id
    ? useQuery(api.orders.getOrder, { id: rider.assigned_order_id })
    : null;

  const updateStatus = useMutation(api.riders.updateStatus);
  const updateLocation = useMutation(api.riders.updateLocation);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  useEffect(() => {
    // TODO: Get rider ID from authentication
    // For now, prompt for rider ID
    const storedRiderId = localStorage.getItem("riderId");
    if (storedRiderId) {
      setRiderId(storedRiderId);
    } else {
      const id = prompt("Enter Rider ID:");
      if (id) {
        setRiderId(id);
        localStorage.setItem("riderId", id);
      }
    }
  }, []);

  // Auto-update location every 5-10 seconds
  useEffect(() => {
    if (!isOnline || !riderId) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation({
            id: riderId as any,
            location: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            },
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
        }
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isOnline, riderId, updateLocation]);

  const handleToggleOnline = async () => {
    if (!riderId) return;

    try {
      await updateStatus({
        id: riderId as any,
        isOnline: !isOnline,
      });
      setIsOnline(!isOnline);
      success(isOnline ? "You are now offline" : "You are now online");
    } catch (err: any) {
      error(err.message || "Failed to update status");
    }
  };

  const handleStartDelivery = async () => {
    if (!riderId || !assignedOrder) return;

    try {
      await updateOrderStatus({
        id: assignedOrder._id,
        status: "out_for_delivery",
      });
      success("Delivery started!");
    } catch (err: any) {
      error(err.message || "Failed to start delivery");
    }
  };

  const handleDelivered = async () => {
    if (!riderId || !assignedOrder) return;

    try {
      await updateOrderStatus({
        id: assignedOrder._id,
        status: "delivered",
      });

      // Mark rider as available
      await updateStatus({
        id: riderId as any,
        isBusy: false,
        assignedOrderId: null,
      });

      success("Order delivered successfully!");
    } catch (err: any) {
      error(err.message || "Failed to mark as delivered");
    }
  };

  if (!riderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please enter your Rider ID to continue
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Rider Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{rider.name}</p>
                <p className="text-sm text-muted-foreground">{rider.phone}</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Assigned Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold">Order #{assignedOrder.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {assignedOrder.status}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Delivery Address:</p>
                <p className="text-sm text-muted-foreground">
                  {assignedOrder.delivery_address.street}, {assignedOrder.delivery_address.city}
                </p>
              </div>

              <div className="flex gap-2">
                {assignedOrder.status === "assigned_to_rider" && (
                  <Button onClick={handleStartDelivery} className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                {assignedOrder.status === "out_for_delivery" && (
                  <Button onClick={handleDelivered} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </div>

              <Button asChild variant="outline" className="w-full">
                <a href={`/track/${assignedOrder._id}`} target="_blank">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assigned orders</p>
              <p className="text-sm mt-2">You will be notified when an order is assigned</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

