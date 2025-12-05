"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, DollarSign, ShoppingBag, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsContent() {
  const { user } = useAuth();

  const dbUser = useQuery(
    api.users.getUser,
    user ? { id: user.id } : "skip"
  ) as { _id: Id<"users"> } | null | undefined;

  const shops = useQuery(
    api.shops.getShopsByOwner,
    dbUser?._id ? { owner_id: dbUser._id, is_active: true } : "skip"
  );

  const activeShop = shops?.[0];

  const dailySales = useQuery(
    api.analytics.getDailySales,
    activeShop ? { shop_id: activeShop._id } : "skip"
  );

  const topProducts = useQuery(
    api.analytics.getTopProducts,
    activeShop ? { shop_id: activeShop._id } : "skip"
  );

  const statusDistribution = useQuery(
    api.analytics.getOrderStatusDistribution,
    activeShop ? { shop_id: activeShop._id } : "skip"
  );

  if (!activeShop || !dailySales || !topProducts || !statusDistribution) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = dailySales.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = dailySales.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your shop&apos;s performance for the last 30 days.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Daily revenue for the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px" }}
                    formatter={(value: number) => [`₹${value}`, "Revenue"]}
                  />
                  <Bar
                    dataKey="sales"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>
              Distribution of order statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusDistribution.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Your best performing items by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} sold
                    </p>
                  </div>
                </div>
                <div className="font-bold">₹{product.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
