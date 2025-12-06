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

    // Create order items for detailed tracking and update stock
    for (const item of args.items) {
      await ctx.db.insert("order_items", {
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price,
      });

      // Update product stock
      const product = await ctx.db.get(item.product_id);
      if (product) {
        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        await ctx.db.patch(item.product_id, {
          stock_quantity: newStock,
          is_available: newStock > 0,
          updated_at: Date.now(),
        });
      }
    }

    // Notify user and shopkeeper about order placement
    const shop = await ctx.db.get(args.shop_id);
    if (shop) {
      // Notify user
      await ctx.db.insert("notifications", {
        user_id: args.user_id,
        title: "Order Placed",
        message: `Your order #${orderNumber} has been placed successfully. Total: ₹${args.total_amount.toFixed(2)}`,
        type: "ORDER",
        data: { order_id: orderId, order_number: orderNumber },
        is_read: false,
        is_sent: false,
        created_at: Date.now(),
      });

      // Notify shopkeeper
      await ctx.db.insert("notifications", {
        user_id: shop.owner_id,
        title: "New Order Received",
        message: `New order #${orderNumber} received. Total: ₹${args.total_amount.toFixed(2)}`,
        type: "ORDER",
        data: { order_id: orderId, order_number: orderNumber },
        is_read: false,
        is_sent: false,
        created_at: Date.now(),
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
        v.literal("accepted_by_shopkeeper"),
        v.literal("assigned_to_rider"),
        v.literal("out_for_delivery"),
        v.literal("delivered"),
        v.literal("cancelled"),
      ),
    ),
    shop_id: v.optional(v.id("shops")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.shop_id) {
      query = query.filter((q) => q.eq(q.field("shop_id"), args.shop_id));
    }

    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("created_at"), args.startDate!));
    }

    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("created_at"), args.endDate!));
    }

    const orders = await query.order("desc").collect();

    const shopIds = Array.from(new Set(orders.map((order) => order.shop_id)));
    const shopMap = new Map<string, any>();

    for (const shopId of shopIds) {
      const shop = await ctx.db.get(shopId);
      if (shop) {
        shopMap.set(shopId, {
          _id: shop._id,
          name: shop.name,
          logo_url: shop.logo_url,
          address: shop.address,
        });
      }
    }

    if (args.limit) {
      return orders.slice(0, args.limit).map((order) => ({
        ...order,
        shop: shopMap.get(order.shop_id) || null,
      }));
    }

    return orders.map((order) => ({
      ...order,
      shop: shopMap.get(order.shop_id) || null,
    }));
  },
});

// Get orders by shop
export const getOrdersByShop = query({
  args: {
    shop_id: v.id("shops"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted_by_shopkeeper"),
        v.literal("assigned_to_rider"),
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

// Accept order by shopkeeper
export const acceptOrder = mutation({
  args: {
    id: v.id("orders"),
    shopkeeper_id: v.id("users"), // Verify shopkeeper owns the shop
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify shopkeeper owns the shop
    const shop = await ctx.db.get(order.shop_id);
    if (!shop || shop.owner_id !== args.shopkeeper_id) {
      throw new Error("Unauthorized: You do not own this shop");
    }

    if (order.status !== "pending") {
      throw new Error(`Order cannot be accepted. Current status: ${order.status}`);
    }

    await ctx.db.patch(args.id, {
      status: "accepted_by_shopkeeper",
      updated_at: Date.now(),
    });

    // Notify user about order acceptance
    await ctx.db.insert("notifications", {
      user_id: order.user_id,
      title: "Order Accepted",
      message: `Your order #${order.order_number} has been accepted by the shopkeeper.`,
      type: "ORDER",
      data: { order_id: args.id, order_number: order.order_number },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return args.id;
  },
});

// Assign rider to order (manual assignment by shopkeeper)
export const assignRider = mutation({
  args: {
    id: v.id("orders"),
    rider_id: v.id("riders"),
    shopkeeper_id: v.id("users"), // Verify shopkeeper owns the shop
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Verify shopkeeper owns the shop
    const shop = await ctx.db.get(order.shop_id);
    if (!shop || shop.owner_id !== args.shopkeeper_id) {
      throw new Error("Unauthorized: You do not own this shop");
    }

    if (order.status !== "accepted_by_shopkeeper") {
      throw new Error(`Order must be accepted first. Current status: ${order.status}`);
    }

    // Verify rider exists and is available
    const rider = await ctx.db.get(args.rider_id);
    if (!rider) {
      throw new Error("Rider not found");
    }
    if (!rider.is_online) {
      throw new Error("Rider is offline");
    }
    if (rider.is_busy) {
      throw new Error("Rider is busy");
    }

    // Update order
    await ctx.db.patch(args.id, {
      status: "assigned_to_rider",
      rider_id: args.rider_id,
      updated_at: Date.now(),
    });

    // Update rider status
    await ctx.db.patch(args.rider_id, {
      is_busy: true,
      assigned_order_id: args.id,
      updated_at: Date.now(),
    });

    // Notify rider (rider is already fetched and validated above)
    await ctx.db.insert("notifications", {
      user_id: rider.rider_id,
      title: "New Delivery Assignment",
      message: `You have been assigned order #${order.order_number}. Please proceed to the shop.`,
      type: "DELIVERY",
      data: { order_id: args.id, order_number: order.order_number },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    // Notify user
    await ctx.db.insert("notifications", {
      user_id: order.user_id,
      title: "Rider Assigned",
      message: `A rider has been assigned to your order #${order.order_number}.`,
      type: "DELIVERY",
      data: { order_id: args.id, order_number: order.order_number },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return args.id;
  },
});

// Update order status (for rider status updates)
export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted_by_shopkeeper"),
      v.literal("assigned_to_rider"),
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

    const updateData: any = {
      status: args.status,
      updated_at: Date.now(),
    };

    if (args.delivery_time) {
      updateData.delivery_time = args.delivery_time;
    }

    // If delivered, mark rider as available
    if (args.status === "delivered" && order.rider_id) {
      await ctx.db.patch(order.rider_id, {
        is_busy: false,
        assigned_order_id: undefined,
      updated_at: Date.now(),
    });
    }

    await ctx.db.patch(args.id, updateData);

    // Send notifications based on status
    if (args.status === "out_for_delivery") {
      // Notify user
      await ctx.db.insert("notifications", {
        user_id: order.user_id,
        title: "Out for Delivery",
        message: `Your order #${order.order_number} is out for delivery.`,
        type: "DELIVERY",
        data: { order_id: args.id, order_number: order.order_number },
        is_read: false,
        is_sent: false,
        created_at: Date.now(),
      });
    } else if (args.status === "delivered") {
      // Get shop to notify shopkeeper
      const shop = await ctx.db.get(order.shop_id);

      // Notify user
      await ctx.db.insert("notifications", {
        user_id: order.user_id,
        title: "Order Delivered",
        message: `Your order #${order.order_number} has been delivered successfully.`,
        type: "DELIVERY",
        data: { order_id: args.id, order_number: order.order_number },
        is_read: false,
        is_sent: false,
        created_at: Date.now(),
      });

      // Notify shopkeeper
      if (shop) {
        await ctx.db.insert("notifications", {
          user_id: shop.owner_id,
          title: "Order Delivered",
          message: `Order #${order.order_number} has been delivered to the customer.`,
          type: "ORDER",
          data: { order_id: args.id, order_number: order.order_number },
          is_read: false,
          is_sent: false,
          created_at: Date.now(),
        });
      }
    }

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

    // Notify user about payment status
    if (args.payment_status === "paid") {
      await ctx.db.insert("notifications", {
        user_id: order.user_id,
        title: "Payment Successful",
        message: `Payment for order #${order.order_number} has been processed successfully.`,
        type: "PAYMENT",
        data: { order_id: args.id, order_number: order.order_number },
        is_read: false,
        is_sent: false,
        created_at: Date.now(),
      });
    }

    return args.id;
  },
});

// Update Razorpay payment details
export const updateRazorpayPayment = mutation({
  args: {
    id: v.id("orders"),
    razorpay_order_id: v.string(),
    razorpay_payment_id: v.string(),
    razorpay_signature: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }

    await ctx.db.patch(args.id, {
      razorpay_order_id: args.razorpay_order_id,
      razorpay_payment_id: args.razorpay_payment_id,
      razorpay_signature: args.razorpay_signature,
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
      accepted_orders: orders.filter((order) => order.status === "accepted_by_shopkeeper")
        .length,
      assigned_orders: orders.filter((order) => order.status === "assigned_to_rider")
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

// Get all orders (for admin)
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    // Sort by created_at descending
    return orders.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  },
});
