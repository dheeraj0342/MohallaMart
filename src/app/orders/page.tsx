"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Package, Navigation } from "lucide-react";
import { format } from "date-fns";
import type { Id } from "@/../convex/_generated/dataModel";

type OrderStatus =
  | "pending"
  | "accepted_by_shopkeeper"
  | "assigned_to_rider"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_DISPLAY: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  pending: { label: "PLACED", variant: "secondary" },
  accepted_by_shopkeeper: { label: "ACCEPTED", variant: "default" },
  assigned_to_rider: { label: "ASSIGNED", variant: "default" },
  out_for_delivery: { label: "DELIVERING", variant: "default" },
  delivered: { label: "DELIVERED", variant: "default" },
  cancelled: { label: "CANCELLED", variant: "destructive" },
};

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Placed", value: "PLACED" },
  { label: "Accepted", value: "ACCEPTED_BY_SHOPKEEPER" },
  { label: "Assigned to rider", value: "ASSIGNED_TO_RIDER" },
  { label: "Out for delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_MAP: Record<string, OrderStatus> = {
  PLACED: "pending",
  PENDING: "pending",
  ACCEPTED_BY_SHOPKEEPER: "accepted_by_shopkeeper",
  ACCEPTED: "accepted_by_shopkeeper",
  ASSIGNED_TO_RIDER: "assigned_to_rider",
  ASSIGNED: "assigned_to_rider",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as { _id: Id<"users"> } | null | undefined;

  const queryArgs = useMemo(() => {
    if (!dbUser?._id) {
      return "skip" as const;
    }

    const startTimestamp = startDate
      ? new Date(startDate).setHours(0, 0, 0, 0)
      : undefined;
    const endTimestamp = endDate
      ? new Date(endDate).setHours(23, 59, 59, 999)
      : undefined;

    return {
      user_id: dbUser._id,
      status:
        statusFilter !== "all"
          ? STATUS_MAP[statusFilter.toUpperCase()] ?? undefined
          : undefined,
      shop_id: shopFilter !== "all" ? (shopFilter as Id<"shops">) : undefined,
      startDate: startTimestamp,
      endDate: endTimestamp,
    };
  }, [dbUser?._id, statusFilter, shopFilter, startDate, endDate]);

  const orders = useQuery(
    api.orders.getOrdersByUser,
    queryArgs === "skip" ? "skip" : queryArgs,
  ) as Array<{
    _id: Id<"orders">;
    order_number: string;
    status: OrderStatus;
    total_amount: number;
    created_at: number;
    items: Array<{ name: string; quantity: number }>;
    delivery_time?: string;
    shop?: { _id: Id<"shops">; name: string };
  }> | null | undefined;

  const shopOptions = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    const unique = new Map<string, string>();
    for (const order of orders) {
      if (order.shop?._id) {
        unique.set(order.shop._id, order.shop.name);
      }
    }
    return Array.from(unique.entries()).map(([id, name]) => ({
      label: name,
      value: id,
    }));
  }, [orders]);

  const renderStatusBadge = (status: OrderStatus) => {
    const config = STATUS_DISPLAY[status] || {
      label: status.toUpperCase(),
      variant: "outline" as const,
    };
    return (
      <Badge variant={config.variant} className="uppercase tracking-wide">
        {config.label}
      </Badge>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Please log in to view your orders.
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground">
            Track your past orders, filter by status, shop, or date range.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Shop</p>
              <Select value={shopFilter} onValueChange={setShopFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All shops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All shops</SelectItem>
                  {shopOptions.map((shop) => (
                    <SelectItem key={shop.value} value={shop.value}>
                      {shop.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Start date</p>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">End date</p>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No orders found for the selected filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="border border-border">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.order_number}
                      </p>
                      <h3 className="text-xl font-semibold text-foreground">
                        {order.shop?.name || "Unknown Shop"}
                      </h3>
                    </div>
                    {renderStatusBadge(order.status)}
                  </div>

                  <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Ordered on
                      </p>
                      <p className="text-foreground font-medium">
                        {format(order.created_at, "dd MMM yyyy, p")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Total amount
                      </p>
                      <p className="text-foreground font-semibold">
                        ₹{order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Items
                      </p>
                      <p className="text-foreground font-medium">
                        {order.items.length} item(s)
                      </p>
                    </div>
                  </div>

                  {order.delivery_time && (
                    <div className="text-sm text-muted-foreground">
                      ETA:{" "}
                      <span className="text-foreground font-medium">
                        {order.delivery_time}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                      Latest status:{" "}
                      <span className="text-foreground font-medium">
                        {STATUS_DISPLAY[order.status]?.label || order.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {["pending", "accepted_by_shopkeeper", "assigned_to_rider", "out_for_delivery"].includes(order.status) && (
                        <Button asChild variant="default" size="sm">
                          <Link href={`/track/${order._id}`}>
                            <Navigation className="h-4 w-4 mr-1" />
                            Track
                          </Link>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order._id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


