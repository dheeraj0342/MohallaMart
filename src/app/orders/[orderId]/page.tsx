"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Truck, User } from "lucide-react";
import { format } from "date-fns";

type OrderStatus =
  | "pending"
  | "accepted_by_shopkeeper"
  | "assigned_to_rider"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STAGE_SEQUENCE: OrderStatus[] = [
  "pending",
  "accepted_by_shopkeeper",
  "out_for_delivery",
  "delivered",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Placed",
  accepted_by_shopkeeper: "Accepted",
  assigned_to_rider: "Assigned",
  out_for_delivery: "Delivering",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.orderId as string;

  const order = useQuery(
    api.orders.getOrder,
    orderId ? { id: orderId as any } : "skip",
  );

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
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

  const rider = riderData && riderUser ? { ...riderData, user: riderUser } : null;

  const timeline = useMemo(() => {
    if (!order) return [];
    const currentStatus: OrderStatus = order.status;
    const currentIndex = STAGE_SEQUENCE.findIndex(
      (stage) =>
        stage === currentStatus ||
        (stage === "accepted_by_shopkeeper" &&
          currentStatus === "assigned_to_rider"),
    );

    return STAGE_SEQUENCE.map((stage, index) => ({
      label: STATUS_LABELS[stage],
      completed:
        currentStatus === "cancelled"
          ? stage === "pending"
          : currentIndex >= 0
            ? index <= currentIndex
            : index === 0,
      isCurrent:
        currentStatus === stage ||
        (stage === "accepted_by_shopkeeper" &&
          currentStatus === "assigned_to_rider"),
      timestamp:
        stage === "pending"
          ? order.created_at
          : currentStatus === stage
            ? order.updated_at
            : undefined,
    }));
  }, [order]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Please log in to view order details.
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (dbUser && order.user_id !== dbUser._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        You are not authorized to view this order.
      </div>
    );
  }

  const totalItems = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">
              Order #{order.order_number}
            </p>
            <h1 className="text-3xl font-bold text-foreground mt-1">
              {shop?.name || "Order Details"}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Placed on {format(order.created_at, "dd MMM yyyy, p")}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <Badge
              variant={isCancelled ? "destructive" : "default"}
              className="uppercase tracking-wide self-end"
            >
              {STATUS_LABELS[order.status as OrderStatus] || order.status}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="text-foreground font-semibold">
                ₹{order.total_amount.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-primary" />
                <div className="text-foreground">
                  <p>{order.delivery_address.street}</p>
                  <p>
                    {order.delivery_address.city}, {order.delivery_address.state}{" "}
                    {order.delivery_address.pincode}
                  </p>
                </div>
              </div>
              {order.delivery_time && (
                <p>
                  ETA:{" "}
                  <span className="text-foreground font-medium">
                    {order.delivery_time}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rider information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {rider ? (
                <>
                  <div className="flex items-center gap-3 text-foreground">
                    <User className="h-4 w-4" />
                    <span>{rider.user.name || "Assigned Rider"}</span>
                  </div>
                  {rider.user.phone && (
                    <p>Contact: {rider.user.phone}</p>
                  )}
                  <div className="flex items-center gap-2 text-foreground">
                    <Truck className="h-4 w-4" />
                    <span>
                      Status: {rider.is_online ? "Online" : "Offline"} •{" "}
                      {rider.is_busy ? "On delivery" : "Available"}
                    </span>
                  </div>
                </>
              ) : (
                <p>No rider assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        step.completed ? "bg-primary" : "bg-muted"
                      }`}
                    />
                    {index !== timeline.length - 1 && (
                      <div className="h-10 w-px bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.timestamp
                        ? format(step.timestamp, "dd MMM yyyy, p")
                        : step.completed
                          ? "Timestamp unavailable"
                          : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Items ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-foreground font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-foreground font-semibold">
                  ₹{item.total_price.toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">
                  ₹{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground font-medium">
                  ₹{order.delivery_fee.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground font-medium">
                  ₹{order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground mt-2">
                <span>Total paid</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" asChild>
            <Link href="/orders">Back to orders</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/track/${order._id}`}>Track Order</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


