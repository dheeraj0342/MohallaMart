"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Truck, User, ArrowLeft, XCircle, Navigation } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/useToast";

type OrderStatus =
  | "pending"
  | "accepted_by_shopkeeper"
  | "assigned_to_rider"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

// Full 5-step sequence (all statuses except cancelled)
const STAGE_SEQUENCE: OrderStatus[] = [
  "pending",
  "accepted_by_shopkeeper",
  "assigned_to_rider",
  "out_for_delivery",
  "delivered",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Placed",
  accepted_by_shopkeeper: "Accepted",
  assigned_to_rider: "Rider Assigned",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Orders that can still be cancelled by the customer
const CANCELLABLE_STATUSES: OrderStatus[] = ["pending", "accepted_by_shopkeeper"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();
  const orderId = params.orderId as string;
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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

  const cancelOrder = useMutation(api.orders.cancelOrder);

  const rider = riderData && riderUser ? { ...riderData, user: riderUser } : null;

  const timeline = useMemo(() => {
    if (!order) return [];
    const currentStatus: OrderStatus = order.status as OrderStatus;
    const currentIndex = STAGE_SEQUENCE.indexOf(currentStatus);

    return STAGE_SEQUENCE.map((stage, index) => ({
      label: STATUS_LABELS[stage],
      completed:
        currentStatus === "cancelled"
          ? stage === "pending"
          : currentIndex >= 0
          ? index <= currentIndex
          : index === 0,
      isCurrent:
        currentStatus !== "cancelled" && currentStatus === stage,
      timestamp:
        stage === "pending"
          ? order.created_at
          : currentStatus === stage
          ? order.updated_at
          : undefined,
    }));
  }, [order]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await cancelOrder({ id: order._id as any });
      success("Order cancelled successfully");
      setCancelDialogOpen(false);
    } catch (err: any) {
      error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Please log in to view order details.
      </div>
    );
  }

  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline">
          <Link href="/orders">Back to Orders</Link>
        </Button>
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

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const canCancel = CANCELLABLE_STATUSES.includes(order.status as OrderStatus);
  const isActiveOrder = !isCancelled && !isDelivered;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* Back + Header */}
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">
                Order #{order.order_number}
              </p>
              <h1 className="text-3xl font-bold text-foreground mt-1">
                {shop?.name || "Order Details"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Placed on {format(order.created_at, "dd MMM yyyy, p")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={isCancelled ? "destructive" : "default"}
                className="uppercase tracking-wide"
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
                    <p>
                      Contact:{" "}
                      <a href={`tel:${rider.user.phone}`} className="text-primary hover:underline">
                        {rider.user.phone}
                      </a>
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-foreground">
                    <Truck className="h-4 w-4" />
                    <span>
                      Status: {rider.is_online ? "Online" : "Offline"} ·{" "}
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

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full transition-colors ${
                        step.completed
                          ? step.isCurrent
                            ? "bg-primary ring-4 ring-primary/20"
                            : "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                    {index !== timeline.length - 1 && (
                      <div className={`h-10 w-px ${step.completed ? "bg-primary/50" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                      {step.isCurrent && (
                        <span className="ml-2 text-xs text-primary font-normal">← current</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.timestamp
                        ? format(step.timestamp, "dd MMM yyyy, p")
                        : step.completed
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              ))}

              {/* Cancelled step */}
              {isCancelled && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-destructive">Cancelled</p>
                    <p className="text-xs text-muted-foreground">
                      {format(order.updated_at, "dd MMM yyyy, p")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
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
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-foreground font-semibold">
                  ₹{item.total_price.toFixed(2)}
                </p>
              </div>
            ))}
            <div className="border-t border-border pt-4 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">
                  ₹{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground font-medium">
                  {order.delivery_fee === 0
                    ? <span className="text-green-600">FREE</span>
                    : `₹${order.delivery_fee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground font-medium">
                  ₹{order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-foreground mt-2 pt-2 border-t">
                <span>Total paid</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to orders
            </Link>
          </Button>

          <div className="flex flex-wrap gap-3">
            {/* Cancel order */}
            {canCancel && (
              <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel this order?</DialogTitle>
                    <DialogDescription>
                      Order #{order.order_number} will be cancelled. This cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isCancelling}>
                      Keep Order
                    </Button>
                    <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
                      {isCancelling ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Yes, Cancel"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Track active orders */}
            {isActiveOrder && (
              <Button asChild>
                <Link href={`/track/${order._id}`}>
                  <Navigation className="h-4 w-4 mr-1" />
                  Track Order
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
