"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import {
  Ticket,
  Plus,
  Trash2,
  Percent,
  IndianRupee,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CouponsContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
  });

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  );

  const activeShop = shops?.[0];

  const coupons = useQuery(
    api.coupons.getCouponsByShop,
    activeShop ? { shop_id: activeShop._id } : "skip"
  );

  const createCoupon = useMutation(api.coupons.createCoupon);
  const toggleStatus = useMutation(api.coupons.toggleCouponStatus);
  const deleteCoupon = useMutation(api.coupons.deleteCoupon);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShop) return;

    try {
      setIsSubmitting(true);
      await createCoupon({
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: formData.min_order_amount
          ? Number(formData.min_order_amount)
          : undefined,
        max_discount_amount: formData.max_discount_amount
          ? Number(formData.max_discount_amount)
          : undefined,
        start_date: new Date(formData.start_date).getTime(),
        end_date: new Date(formData.end_date).getTime(),
        usage_limit: formData.usage_limit
          ? Number(formData.usage_limit)
          : undefined,
        shop_id: activeShop._id,
      });
      success("Coupon created successfully");
      setIsDialogOpen(false);
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_amount: "",
        max_discount_amount: "",
        start_date: "",
        end_date: "",
        usage_limit: "",
      });
    } catch (err) {
      error("Failed to create coupon");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"coupons">) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCoupon({ id });
        success("Coupon deleted");
      } catch {
        error("Failed to delete coupon");
      }
    }
  };

  if (!activeShop) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading shop data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discounts and promotional codes for your customers.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Set up a new discount code for your customers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="SUMMER20"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  className="uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="20% off on summer fruits"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v: "percentage" | "fixed") =>
                      setFormData({ ...formData, discount_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    placeholder={
                      formData.discount_type === "percentage" ? "20" : "100"
                    }
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min_order">Min Order (₹)</Label>
                  <Input
                    id="min_order"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.min_order_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_order_amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_discount">Max Discount (₹)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    min="0"
                    placeholder="200"
                    value={formData.max_discount_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value,
                      })
                    }
                    disabled={formData.discount_type === "fixed"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit">Usage Limit (Optional)</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.usage_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => (
          <Card key={coupon._id} className={!coupon.is_active ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-mono text-xl tracking-wider text-primary">
                    {coupon.code}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {coupon.description || "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDelete(coupon._id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  {coupon.discount_type === "percentage" ? (
                    <Percent className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  )}
                  {coupon.discount_value}
                  {coupon.discount_type === "percentage" && "%"} OFF
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span className="font-medium text-foreground">
                      {coupon.min_order_amount
                        ? `₹${coupon.min_order_amount}`
                        : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span className="font-medium text-foreground">
                      {format(coupon.end_date, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <span className="font-medium text-foreground">
                      {coupon.usage_count} /{" "}
                      {coupon.usage_limit ? coupon.usage_limit : "∞"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor={`active-${coupon._id}`} className="text-sm">
                    {coupon.is_active ? "Active" : "Inactive"}
                  </Label>
                  <Switch
                    id={`active-${coupon._id}`}
                    checked={coupon.is_active}
                    onCheckedChange={(checked) =>
                      toggleStatus({ id: coupon._id, is_active: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {coupons?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No coupons yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-4">
              Create your first coupon to attract more customers and boost sales.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create First Coupon
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
