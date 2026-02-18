"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Loader2,
  MapPin,
  Package,
  Navigation,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  ArrowLeft,
  XCircle,
  CreditCard,
} from "lucide-react";
import dynamic from "next/dynamic";
import { haversineDistanceKm } from "@/lib/distance";
import { calculateEtaMinutes, DEFAULT_STORE_PROFILE } from "@/lib/eta";
import { format } from "date-fns";

const OrderTrackingMap = dynamic(() => import("@/components/OrderTrackingMap"), { ssr: false });

type OrderStatus =
  | "pending"
  | "accepted_by_shopkeeper"
  | "assigned_to_rider"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: "Order Placed",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    description: "Waiting for shopkeeper to accept",
  },
  accepted_by_shopkeeper: {
    label: "Accepted",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
    description: "Shopkeeper is preparing your order",
  },
  assigned_to_rider: {
    label: "Rider Assigned",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
    description: "Rider is heading to pick up your order",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30",
    description: "Your order is on the way",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30",
    description: "Your order has been delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30",
    description: "This order was cancelled",
  },
};

const STATUS_STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "accepted_by_shopkeeper", label: "Accepted", icon: CheckCircle2 },
  { key: "assigned_to_rider", label: "Rider Assigned", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Navigation },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STEP_ORDER: OrderStatus[] = [
  "pending",
  "accepted_by_shopkeeper",
  "assigned_to_rider",
  "out_for_delivery",
  "delivered",
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  // All hooks called unconditionally — use "skip" for conditional queries
  const order = useQuery(
    api.orders.getOrder,
    orderId ? { id: orderId as any } : "skip",
  );

  const shop = useQuery(
    api.shops.getShop,
    order?.shop_id ? { id: order.shop_id } : "skip",
  );

  const riderData = useQuery(
    api.riders.getById,
    order?.rider_id ? { id: order.rider_id } : "skip",
  );

  const riderUser = useQuery(
    api.users.getUser,
    riderData?.rider_id ? { id: riderData.rider_id } : "skip",
  );

  const rider =
    riderData && riderUser
      ? { ...riderData, name: riderUser.name || "Rider", phone: riderUser.phone || "" }
      : null;

  const [eta, setEta] = useState<{ minEta: number; maxEta: number } | null>(null);

  // ETA: recalculate every 10 s when rider location is known
  useEffect(() => {
    if (!order || !rider || !order.delivery_address.coordinates) {
      setEta(null);
      return;
    }

    const calculateEta = () => {
      const { lat: rLat, lon: rLon } = rider.current_location;
      const { lat: dLat, lng: dLng } = order.delivery_address.coordinates!;

      const distanceKm = haversineDistanceKm(rLat, rLon, dLat, dLng);
      const result = calculateEtaMinutes({
        storeProfile: DEFAULT_STORE_PROFILE,
        distanceKm,
        currentPendingOrders: 0,
        isPeakHour: false,
      });
      setEta({ minEta: result.minEta, maxEta: result.maxEta });
    };

    calculateEta();
    const interval = setInterval(calculateEta, 10_000);
    return () => clearInterval(interval);
  }, [order, rider]);

  // Loading state
  if (order === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (order === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <Package className="h-16 w-16 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="text-muted-foreground text-sm">This order doesn&apos;t exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.pending;
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const currentStepIdx = STEP_ORDER.indexOf(order.status as OrderStatus);

  const shopLocation = shop?.address?.coordinates
    ? { lat: shop.address.coordinates.lat, lon: shop.address.coordinates.lng }
    : null;

  const deliveryLocation = order.delivery_address.coordinates
    ? { lat: order.delivery_address.coordinates.lat, lon: order.delivery_address.coordinates.lng }
    : null;

  const riderLocation = rider?.current_location
    ? { lat: rider.current_location.lat, lon: rider.current_location.lon }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Tracking order</p>
            <h1 className="text-lg font-bold truncate">
              #{order.order_number}
              {shop?.name ? ` · ${shop.name}` : ""}
            </h1>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${statusConfig.color}`}>
          {isCancelled ? (
            <XCircle className="h-6 w-6 shrink-0" />
          ) : isDelivered ? (
            <CheckCircle2 className="h-6 w-6 shrink-0" />
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{statusConfig.label}</p>
            <p className="text-sm opacity-80">{statusConfig.description}</p>
          </div>
          {eta && !isCancelled && !isDelivered && (
            <div className="text-right shrink-0">
              <p className="text-xs opacity-70">ETA</p>
              <p className="font-bold text-sm">{eta.minEta}–{eta.maxEta} min</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {STATUS_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const stepIdx = STEP_ORDER.indexOf(step.key);
                  const isCompleted = !isCancelled && currentStepIdx >= stepIdx;
                  const isActive = !isCancelled && order.status === step.key;

                  return (
                    <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                      {/* Connector line */}
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-6 -translate-x-1/2 transition-colors ${
                            isCompleted ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                      {/* Icon */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground border-primary"
                            : isActive
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted text-muted-foreground border-muted-foreground/30"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {/* Label */}
                      <div className="flex-1 pt-2 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isActive && !isCancelled && (
                          <p className="text-xs text-primary mt-0.5 font-medium">Current</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Cancelled overlay step */}
                {isCancelled && (
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-destructive/10 text-destructive border-destructive/50">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-sm font-medium text-destructive">Cancelled</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(order.updated_at, "dd MMM yyyy, p")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary + Rider + Address */}
          <div className="space-y-4">
            {/* Rider info */}
            {rider && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Your Rider
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{rider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rider.is_online ? "Online" : "Offline"} ·{" "}
                        {rider.is_busy ? "On delivery" : "Available"}
                      </p>
                    </div>
                    {rider.phone && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${rider.phone}`}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery address */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">
                  {order.delivery_address.street}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.pincode}
                </p>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {order.payment_method === "cash" ? "Cash on Delivery" : "Online (Razorpay)"}
                  </span>
                  <Badge
                    variant={
                      order.payment_status === "paid"
                        ? "default"
                        : order.payment_status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                    className="uppercase text-xs"
                  >
                    {order.payment_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Map */}
        {(shopLocation || deliveryLocation || riderLocation) && !isCancelled && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Live Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4 px-6">
              <div className="h-72 md:h-96 rounded-lg overflow-hidden border border-border">
                <OrderTrackingMap
                  shopLocation={shopLocation}
                  deliveryLocation={deliveryLocation}
                  riderLocation={riderLocation}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {shopLocation && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Shop
                  </span>
                )}
                {deliveryLocation && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Your location
                  </span>
                )}
                {riderLocation && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Rider (live)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-foreground">
                    {item.name}
                    <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">₹{item.total_price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span>
                  {order.delivery_fee === 0
                    ? <span className="text-green-600">FREE</span>
                    : `₹${order.delivery_fee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1 border-t">
                <span>Total</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-3 justify-between">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              My Orders
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/orders/${order._id}`}>View Full Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
