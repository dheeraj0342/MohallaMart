import { query } from "./_generated/server";
import { v } from "convex/values";

// Get daily sales for the last 30 days
export const getDailySales = query({
  args: {
    shop_id: v.id("shops"),
    days: v.optional(v.number()), // Default 30
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id))
      .filter((q) => q.gte(q.field("created_at"), startDate.getTime()))
      .collect();

    // Group by date
    const salesMap = new Map<string, { date: string; sales: number; orders: number }>();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesMap.set(dateStr, { date: dateStr, sales: 0, orders: 0 });
    }

    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      const dateStr = new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      
      const entry = salesMap.get(dateStr);
      if (entry) {
        entry.sales += order.total_amount;
        entry.orders += 1;
      }
    });

    return Array.from(salesMap.values());
  },
});

// Get top selling products
export const getTopProducts = query({
  args: {
    shop_id: v.id("shops"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    // Get all orders for the shop
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id))
      .collect();

    const validOrderIds = new Set(
      orders
        .filter((o) => o.status !== "cancelled")
        .map((o) => o._id)
    );

    // This is inefficient for large datasets but works for MVP
    // Ideally we'd have aggregated stats on products
    const allOrderItems = await ctx.db.query("order_items").collect();
    
    const productStats = new Map<string, { name: string; revenue: number; quantity: number }>();

    for (const item of allOrderItems) {
      if (!validOrderIds.has(item.order_id)) continue;

      // We need product name, so we might need to fetch it if not in item
      // But order_items usually don't have name. 
      // Let's check schema or fetch product.
      // Checking schema from memory: order_items has product_id.
      
      const current = productStats.get(item.product_id) || { name: "", revenue: 0, quantity: 0 };
      current.revenue += item.total_price;
      current.quantity += item.quantity;
      productStats.set(item.product_id, current);
    }

    // Fetch product names for top items
    const sortedStats = Array.from(productStats.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit);

    const result = [];
    for (const [productId, stats] of sortedStats) {
      const product = await ctx.db.get(productId as any);
      result.push({
        name: product?.name || "Unknown Product",
        revenue: stats.revenue,
        quantity: stats.quantity,
      });
    }

    return result;
  },
});

// Get order status distribution
export const getOrderStatusDistribution = query({
  args: {
    shop_id: v.id("shops"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id))
      .collect();

    const distribution = {
      pending: 0,
      accepted: 0,
      delivering: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      switch (order.status) {
        case "pending":
          distribution.pending++;
          break;
        case "accepted_by_shopkeeper":
        case "assigned_to_rider":
          distribution.accepted++;
          break;
        case "out_for_delivery":
          distribution.delivering++;
          break;
        case "delivered":
          distribution.delivered++;
          break;
        case "cancelled":
          distribution.cancelled++;
          break;
      }
    });

    return [
      { name: "Pending", value: distribution.pending, fill: "#f59e0b" }, // amber
      { name: "Processing", value: distribution.accepted, fill: "#3b82f6" }, // blue
      { name: "Delivering", value: distribution.delivering, fill: "#8b5cf6" }, // violet
      { name: "Delivered", value: distribution.delivered, fill: "#22c55e" }, // green
      { name: "Cancelled", value: distribution.cancelled, fill: "#ef4444" }, // red
    ].filter(item => item.value > 0);
  },
});
