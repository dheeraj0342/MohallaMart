"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Store, User, FileText, Package, TrendingUp, CheckCircle2, Clock, XCircle, Star, Phone, Mail } from "lucide-react";

type ShopAddress = {
  city?: string;
  state?: string;
  street?: string;
  pincode?: string;
};

type Shop = {
  _id: Id<"shops">;
  name: string;
  address: ShopAddress;
  rating: number;
  logo_url?: string;
};

type ShopStats = {
  total_orders: number;
  cancelled_orders: number;
  delivered_orders: number;
  average_order_value: number;
};

type Product = {
  _id: Id<"products">;
  is_available: boolean;
};

type Registration = {
  pan?: string;
  gstin?: string;
  business?: { type?: string };
  status?: "approved" | "pending" | "rejected";
  address?: ShopAddress;
  pickup_address?: ShopAddress;
};

type DBUser = {
  _id: Id<"users">;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
};

export default function ProfileContent() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip",
  ) as DBUser | null | undefined;
  const updateUser = useMutation(api.users.updateUser);
  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser ? { owner_id: dbUser._id, is_active: true } : "skip",
  ) as Shop[] | null | undefined;
  const shop = Array.isArray(shops) && shops.length > 0 ? shops[0] : null;
  const shopStats = useQuery(
    api.shops.getShopStats,
    shop ? { id: shop._id } : "skip",
  ) as ShopStats | null | undefined;
  const products = useQuery(
    api.products.getProductsByShop,
    shop ? { shop_id: shop._id } : "skip",
  ) as Product[] | null | undefined;
  const registration = useQuery(
    api.registrations.getMyRegistration,
    user ? { userId: user.id } : "skip",
  ) as Registration | null | undefined;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setPhone(dbUser.phone || "");
      setAvatar(dbUser.avatar_url || "");
    }
  }, [dbUser]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUser({ id: user.id, name, phone, avatar_url: avatar });
      success("Profile updated successfully");
    } catch (err) {
      error("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !dbUser) {
    return null;
  }

  const totalOrders = shopStats?.total_orders || 0;
  const cancelledOrders = shopStats?.cancelled_orders || 0;
  const deliveredOrders = shopStats?.delivered_orders || 0;
  const fulfilmentRate = totalOrders > 0 ? Math.round(((totalOrders - cancelledOrders) / totalOrders) * 100) : 0;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;
  const avgOrderValue = shopStats?.average_order_value ? Math.round(shopStats.average_order_value) : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const activeProducts = Array.isArray(products) ? products.filter((p) => p.is_available).length : 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={avatar || dbUser.avatar_url} alt={name || dbUser.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {name?.[0]?.toUpperCase() || dbUser.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{shop?.name || name || "Your Shop"}</h1>
              <p className="text-muted-foreground mt-1">
                {shop?.address?.city || "City"}, {shop?.address?.state || "State"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {dbUser?.is_active ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {shop?.rating && (
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700 dark:text-yellow-300">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                    {shop.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registration
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{deliveredOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Fulfilment Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{fulfilmentRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fulfilmentRate >= 90 ? "Excellent" : fulfilmentRate >= 70 ? "Good" : "Needs Improvement"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">₹{avgOrderValue}</div>
                </CardContent>
              </Card>
            </div>

            {/* Shop Info & Health */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Shop Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shop Name</span>
                    <span className="text-sm font-medium text-foreground">{shop?.name || "—"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium text-foreground">
                      {shop?.address?.city || "—"}, {shop?.address?.state || "—"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <span className="text-sm font-medium text-foreground">
                      {shop?.rating?.toFixed(1) || "—"} / 5.0
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Products</span>
                    <span className="text-sm font-medium text-foreground">{activeProducts} / {totalProducts}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Account Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fulfilment Rate</span>
                    <Badge
                      className={
                        fulfilmentRate >= 90
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : fulfilmentRate >= 70
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      }
                    >
                      {fulfilmentRate}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Cancellation Rate</span>
                    <Badge
                      className={
                        cancellationRate <= 5
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : cancellationRate <= 10
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                      }
                    >
                      {cancellationRate}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Verification</span>
                    {dbUser?.is_active ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your seller name"
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={dbUser?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="bg-background"
                    />
                    {avatar && (
                      <div className="mt-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={avatar} alt="Preview" />
                          <AvatarFallback>AV</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">Preview</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="registration">
            {registration ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Registration Details</CardTitle>
                  <Badge
                    className={
                      registration.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : registration.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }
                  >
                    {registration.status === "approved" && (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </>
                    )}
                    {registration.status === "rejected" && (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </>
                    )}
                    {registration.status === "pending" && (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    )}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground uppercase">PAN</Label>
                        <p className="text-lg font-semibold text-foreground mt-1">
                          {registration.pan || "—"}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground uppercase">GSTIN</Label>
                        <p className="text-lg font-semibold text-foreground mt-1">
                          {registration.gstin || "—"}
                        </p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground uppercase">Business Type</Label>
                        <p className="text-lg font-semibold text-foreground mt-1 capitalize">
                          {registration.business?.type || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-2 block">Business Address</Label>
                        <div className="p-4 bg-muted rounded-lg space-y-1">
                          <p className="font-medium text-foreground">
                            {registration.address?.street || "—"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {registration.address?.city || "—"}, {registration.address?.state || "—"}{" "}
                            {registration.address?.pincode || ""}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-foreground mb-2 block">Pickup Address</Label>
                        <div className="p-4 bg-muted rounded-lg space-y-1">
                          <p className="font-medium text-foreground">
                            {registration.pickup_address?.street || "—"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {registration.pickup_address?.city || "—"}, {registration.pickup_address?.state || "—"}{" "}
                            {registration.pickup_address?.pincode || ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button variant="outline" className="w-full">
                    Edit Registration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Registration Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete your business registration to unlock seller features.
                  </p>
                  <Button>Start Registration</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
