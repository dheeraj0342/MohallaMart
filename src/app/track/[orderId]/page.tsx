"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/../../convex/_generated/api";
import { Loader2, MapPin, Package, Navigation, CheckCircle2, Clock, Truck } from "lucide-react";
import dynamic from "next/dynamic";
import { haversineDistanceKm } from "@/lib/distance";
import { calculateEtaMinutes, DEFAULT_STORE_PROFILE } from "@/lib/eta";

const OrderTrackingMap = dynamic(() => import("@/components/OrderTrackingMap"), { ssr: false });

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const order = useQuery(api.orders.getOrder, orderId ? { id: orderId as any } : "skip");
  const shop = order?.shop_id
    ? useQuery(api.shops.getShop, { id: order.shop_id })
    : null;

  // Get rider with user details
  const riderData = order?.rider_id
    ? useQuery(api.riders.getById, { id: order.rider_id })
    : null;

  const riderUser = riderData?.rider_id
    ? useQuery(api.users.getUser, { id: riderData.rider_id })
    : null;

  // Combine rider data with user info
  const rider = riderData && riderUser ? {
    ...riderData,
    name: riderUser.name || "Unknown Rider",
    phone: riderUser.phone || "",
  } : null;

  const [eta, setEta] = useState<{ minEta: number; maxEta: number } | null>(null);

  useEffect(() => {
    if (!order || !rider || !order.delivery_address.coordinates) return;

    // Calculate ETA based on rider location
    const calculateEta = () => {
      const riderLocation = rider.current_location;
      const deliveryLocation = order.delivery_address.coordinates!;

      const distanceKm = haversineDistanceKm(
        riderLocation.lat,
        riderLocation.lon,
        deliveryLocation.lat,
        deliveryLocation.lng
      );

      const etaResult = calculateEtaMinutes({
        storeProfile: DEFAULT_STORE_PROFILE,
        distanceKm,
        currentPendingOrders: 0,
        isPeakHour: false,
      });

      setEta({
        minEta: etaResult.minEta,
        maxEta: etaResult.maxEta,
      });
    };

    calculateEta();
    const interval = setInterval(calculateEta, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [order, rider]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const shopLocation = shop?.address?.coordinates
    ? { lat: shop.address.coordinates.lat, lon: shop.address.coordinates.lng }
    : null;

  const deliveryLocation = order.delivery_address.coordinates
    ? { lat: order.delivery_address.coordinates.lat, lon: order.delivery_address.coordinates.lng }
    : null;

  const riderLocation = rider?.current_location
    ? { lat: rider.current_location.lat, lon: rider.current_location.lon }
    : null;

  // Order status timeline
  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Package, completed: order.status !== "pending" },
    { key: "accepted_by_shopkeeper", label: "Accepted", icon: CheckCircle2, completed: ["accepted_by_shopkeeper", "assigned_to_rider", "out_for_delivery", "delivered"].includes(order.status) },
    { key: "assigned_to_rider", label: "Rider Assigned", icon: Truck, completed: ["assigned_to_rider", "out_for_delivery", "delivered"].includes(order.status) },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation, completed: ["out_for_delivery", "delivered"].includes(order.status) },
    { key: "delivered", label: "Delivered", icon: CheckCircle2, completed: order.status === "delivered" },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order.status) || 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.order_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </div>
              {eta && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Estimated arrival: {eta.minEta}-{eta.maxEta} minutes
                  </span>
                </div>
              )}
              {rider && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Rider: {rider.name} ({rider.phone})
                  </span>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Order Items:</p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.total_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = order.status === step.key;
                const isCompleted = step.completed;
                return (
                  <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    <div className="relative z-10">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                        ? "bg-primary text-primary-foreground border-primary"
                        : isActive
                          ? "bg-primary/10 text-primary border-primary"
                          : "bg-muted text-muted-foreground border-muted-foreground"
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`absolute left-1/2 top-10 w-0.5 h-8 -translate-x-1/2 ${isCompleted ? "bg-primary" : "bg-muted"
                          }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-semibold ${isCompleted || isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      {isActive && (
                        <p className="text-xs text-muted-foreground mt-1">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        {(shopLocation || deliveryLocation || riderLocation) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden border border-border">
                <OrderTrackingMap
                  shopLocation={shopLocation}
                  deliveryLocation={deliveryLocation}
                  riderLocation={riderLocation}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {shopLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-red-600">Shop:</span> {shopLocation.lat.toFixed(6)}, {shopLocation.lon.toFixed(6)}
                  </p>
                )}
                {deliveryLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-green-600">Delivery:</span> {deliveryLocation.lat.toFixed(6)}, {deliveryLocation.lon.toFixed(6)}
                  </p>
                )}
                {riderLocation && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-blue-600">Rider (Live):</span> {riderLocation.lat.toFixed(6)}, {riderLocation.lon.toFixed(6)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

