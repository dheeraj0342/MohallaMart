"use client";

import ShopkeeperGuard from "../_components/ShopkeeperGuard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Package, Clock, CheckCircle2, XCircle, Truck, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

export default function ShopkeeperOrdersPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<Id<"riders"> | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { _id?: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  ) as Array<{ _id: Id<"shops"> }> | null | undefined;

  const shopId = shops && shops.length > 0 ? shops[0]._id : null;

  const orders = useQuery(
    api.orders.getOrdersByShop,
    shopId ? { shop_id: shopId } : "skip"
  ) as Array<{
    _id: Id<"orders">;
    order_number: string;
    status: string;
    total_amount: number;
    created_at: number;
    rider_id?: Id<"riders">;
    items: Array<{ name: string; quantity: number }>;
    delivery_address: {
      street: string;
      city: string;
      pincode: string;
      state: string;
    };
  }> | null | undefined;

  const availableRiders = useQuery(api.riders.getAvailableRiders) as Array<{
    _id: Id<"riders">;
    name: string;
    phone: string;
    current_location: { lat: number; lon: number };
  }> | null | undefined;

  const acceptOrder = useMutation(api.orders.acceptOrder);
  const assignRider = useMutation(api.orders.assignRider);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "PENDING" },
      accepted_by_shopkeeper: { variant: "default", icon: UserCheck, label: "ACCEPTED" },
      assigned_to_rider: { variant: "default", icon: UserPlus, label: "ASSIGNED TO RIDER" },
      out_for_delivery: { variant: "default", icon: Truck, label: "OUT FOR DELIVERY" },
      delivered: { variant: "default", icon: CheckCircle2, label: "DELIVERED" },
      cancelled: { variant: "destructive", icon: XCircle, label: "CANCELLED" },
    };
    const config = variants[status] || { variant: "default" as const, icon: Package, label: status.toUpperCase() };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleAcceptOrder = async (orderId: Id<"orders">) => {
    if (!dbUser?._id) {
      error("User not found");
      return;
    }

    try {
      await acceptOrder({
        id: orderId,
        shopkeeper_id: dbUser._id,
      });
      success("Order accepted successfully");
    } catch (err: any) {
      error(err.message || "Failed to accept order");
    }
  };

  const handleAssignRider = async () => {
    if (!selectedOrderId || !selectedRiderId || !dbUser?._id) {
      error("Please select an order and rider");
      return;
    }

    try {
      await assignRider({
        id: selectedOrderId,
        rider_id: selectedRiderId,
        shopkeeper_id: dbUser._id,
      });
      success("Rider assigned successfully");
      setIsAssignDialogOpen(false);
      setSelectedOrderId(null);
      setSelectedRiderId(null);
    } catch (err: any) {
      error(err.message || "Failed to assign rider");
    }
  };

  const openAssignDialog = (orderId: Id<"orders">) => {
    setSelectedOrderId(orderId);
    setIsAssignDialogOpen(true);
  };

  const handleMarkOutForDelivery = async (orderId: Id<"orders">) => {
    try {
      await updateOrderStatus({ id: orderId, status: "out_for_delivery" });
      success("Order marked as out for delivery");
    } catch (err: any) {
      error(err.message || "Failed to update order status");
    }
  };

  const handleMarkDelivered = async (orderId: Id<"orders">) => {
    try {
      await updateOrderStatus({ id: orderId, status: "delivered" });
      success("Order marked as delivered");
    } catch (err: any) {
      error(err.message || "Failed to update order status");
    }
  };

  if (!orders) {
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
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and track all your shop orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Items</p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_address.street}, {order.delivery_address.city}, {order.delivery_address.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-lg font-semibold text-foreground">₹{order.total_amount.toFixed(2)}</p>
                      {order.rider_id && (
                        <p className="text-xs text-muted-foreground mt-1">Rider assigned</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button
                          onClick={() => handleAcceptOrder(order._id)}
                          variant="default"
                          size="sm"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept Order
                        </Button>
                      )}
                      {order.status === "accepted_by_shopkeeper" && (
                        <Dialog open={isAssignDialogOpen && selectedOrderId === order._id} onOpenChange={setIsAssignDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => openAssignDialog(order._id)}
                              variant="default"
                              size="sm"
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Rider
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="border-border bg-card">
                            <DialogHeader>
                              <DialogTitle>Assign Rider</DialogTitle>
                              <DialogDescription>
                                Select an available rider for this order
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {availableRiders && availableRiders.length > 0 ? (
                                <>
                                  <Select
                                    value={selectedRiderId || undefined}
                                    onValueChange={(value) => setSelectedRiderId(value as Id<"riders">)}
                                  >
                                    <SelectTrigger className="bg-background border-border">
                                      <SelectValue placeholder="Select a rider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableRiders.map((rider) => (
                                        <SelectItem key={rider._id} value={rider._id}>
                                          {rider.name} - {rider.phone}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setIsAssignDialogOpen(false);
                                        setSelectedRiderId(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleAssignRider}
                                      disabled={!selectedRiderId}
                                    >
                                      Assign Rider
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No available riders at the moment
                                </p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {order.status === "assigned_to_rider" && (
                        <Button
                          onClick={() => handleMarkOutForDelivery(order._id)}
                          variant="default"
                          size="sm"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Out for Delivery
                        </Button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <Button
                          onClick={() => handleMarkDelivered(order._id)}
                          variant="default"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/track/${order._id}`}>
                          Track
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ShopkeeperGuard>
  );
}
