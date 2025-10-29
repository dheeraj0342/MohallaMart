import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new order
export const createOrder = mutation({
  args: {
    user_id: v.id("users"),
    shop_id: v.id("shops"),
    items: v.array(
      v.object({
        product_id: v.id("products"),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        total_price: v.number(),
      }),
    ),
    subtotal: v.number(),
    delivery_fee: v.number(),
    tax: v.number(),
    total_amount: v.number(),
    delivery_address: v.object({
      street: v.string(),
      city: v.string(),
      pincode: v.string(),
      state: v.string(),
      coordinates: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    }),
    payment_method: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate order number
    const orderNumber = `MM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order
    const orderId = await ctx.db.insert("orders", {
      user_id: args.user_id,
      shop_id: args.shop_id,
      order_number: orderNumber,
      status: "pending",
      items: args.items,
      subtotal: args.subtotal,
      delivery_fee: args.delivery_fee,
      tax: args.tax,
      total_amount: args.total_amount,
      delivery_address: args.delivery_address,
      payment_method: args.payment_method,
      payment_status: "pending",
      notes: args.notes,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    // Create order items for detailed tracking
    for (const item of args.items) {
      await ctx.db.insert("order_items", {
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price,
      });
    }

    return orderId;
  },
});

// Get order by ID
export const getOrder = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get orders by user
export const getOrdersByUser = query({
  args: {
    user_id: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("out_for_delivery"),
        v.literal("delivered"),
        v.literal("cancelled"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const orders = await query.order("desc").collect();

    if (args.limit) {
      return orders.slice(0, args.limit);
    }

    return orders;
  },
});

// Get orders by shop
export const getOrdersByShop = query({
  args: {
    shop_id: v.id("shops"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("out_for_delivery"),
        v.literal("delivered"),
        v.literal("cancelled"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const orders = await query.order("desc").collect();

    if (args.limit) {
      return orders.slice(0, args.limit);
    }

    return orders;
  },
});

// Update order status
export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    delivery_time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.delivery_time && { delivery_time: args.delivery_time }),
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    id: v.id("orders"),
    payment_status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.id, {
      payment_status: args.payment_status,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Cancel order
export const cancelOrder = mutation({
  args: {
    id: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "delivered") {
      throw new Error("Cannot cancel delivered order");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      notes: args.reason
        ? `${order.notes || ""}\nCancellation reason: ${args.reason}`
        : order.notes,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Get order items
export const getOrderItems = query({
  args: { order_id: v.id("orders") },
  handler: async (ctx, args) => {
    const orderItems = await ctx.db
      .query("order_items")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id))
      .collect();

    // Get product details for each order item
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        return {
          ...item,
          product,
        };
      }),
    );

    return itemsWithProducts;
  },
});

// Get order statistics
export const getOrderStats = query({
  args: {
    user_id: v.optional(v.id("users")),
    shop_id: v.optional(v.id("shops")),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();

    // Filter by user
    if (args.user_id) {
      orders = orders.filter((order) => order.user_id === args.user_id);
    }

    // Filter by shop
    if (args.shop_id) {
      orders = orders.filter((order) => order.shop_id === args.shop_id);
    }

    // Filter by date range
    if (args.start_date) {
      orders = orders.filter((order) => order.created_at >= args.start_date!);
    }
    if (args.end_date) {
      orders = orders.filter((order) => order.created_at <= args.end_date!);
    }

    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      pending_orders: orders.filter((order) => order.status === "pending")
        .length,
      confirmed_orders: orders.filter((order) => order.status === "confirmed")
        .length,
      preparing_orders: orders.filter((order) => order.status === "preparing")
        .length,
      out_for_delivery_orders: orders.filter(
        (order) => order.status === "out_for_delivery",
      ).length,
      delivered_orders: orders.filter((order) => order.status === "delivered")
        .length,
      cancelled_orders: orders.filter((order) => order.status === "cancelled")
        .length,
      average_order_value:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + order.total_amount, 0) /
            orders.length
          : 0,
    };

    return stats;
  },
});

// Get recent orders
export const getRecentOrders = query({
  args: {
    user_id: v.optional(v.id("users")),
    shop_id: v.optional(v.id("shops")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders;

    if (args.user_id) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q: any) => q.eq("user_id", args.user_id))
        .order("desc")
        .collect();
    } else if (args.shop_id) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_shop", (q: any) => q.eq("shop_id", args.shop_id))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db.query("orders").order("desc").collect();
    }

    if (args.limit) {
      return orders.slice(0, args.limit);
    }

    return orders;
  },
});
