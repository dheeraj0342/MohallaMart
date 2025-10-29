import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new notification
export const createNotification = mutation({
  args: {
    user_id: v.id("users"),
    type: v.union(
      v.literal("order_update"),
      v.literal("promotion"),
      v.literal("system"),
      v.literal("delivery"),
    ),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      type: args.type,
      title: args.title,
      message: args.message,
      data: args.data,
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

// Get notifications by user
export const getNotificationsByUser = query({
  args: {
    user_id: v.id("users"),
    is_read: v.optional(v.boolean()),
    type: v.optional(
      v.union(
        v.literal("order_update"),
        v.literal("promotion"),
        v.literal("system"),
        v.literal("delivery"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id));

    if (args.is_read !== undefined) {
      query = query.filter((q) => q.eq(q.field("is_read"), args.is_read));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    const notifications = await query.order("desc").collect();

    if (args.limit) {
      return notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.id, {
      is_read: true,
    });

    return args.id;
  },
});

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .filter((q) => q.eq(q.field("is_read"), false))
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { is_read: true }),
      ),
    );

    return notifications.length;
  },
});

// Get unread notification count
export const getUnreadNotificationCount = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .filter((q) => q.eq(q.field("is_read"), false))
      .collect();

    return notifications.length;
  },
});

// Send notification (mark as sent)
export const sendNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.id, {
      is_sent: true,
      sent_at: Date.now(),
    });

    return args.id;
  },
});

// Create order update notification
export const createOrderUpdateNotification = mutation({
  args: {
    user_id: v.id("users"),
    order_id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    order_number: v.string(),
  },
  handler: async (ctx, args) => {
    const statusMessages = {
      pending: "Your order is being processed",
      confirmed: "Your order has been confirmed",
      preparing: "Your order is being prepared",
      out_for_delivery: "Your order is out for delivery",
      delivered: "Your order has been delivered",
      cancelled: "Your order has been cancelled",
    };

    const title = `Order ${args.order_number} Update`;
    const message = statusMessages[args.status];

    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      type: "order_update",
      title,
      message,
      data: {
        order_id: args.order_id,
        order_number: args.order_number,
        status: args.status,
      },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

// Create promotion notification
export const createPromotionNotification = mutation({
  args: {
    user_id: v.id("users"),
    title: v.string(),
    message: v.string(),
    promotion_data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      type: "promotion",
      title: args.title,
      message: args.message,
      data: args.promotion_data,
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

// Create system notification
export const createSystemNotification = mutation({
  args: {
    user_id: v.id("users"),
    title: v.string(),
    message: v.string(),
    system_data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      type: "system",
      title: args.title,
      message: args.message,
      data: args.system_data,
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

// Create delivery notification
export const createDeliveryNotification = mutation({
  args: {
    user_id: v.id("users"),
    order_id: v.id("orders"),
    order_number: v.string(),
    delivery_time: v.optional(v.string()),
    delivery_address: v.object({
      street: v.string(),
      city: v.string(),
      pincode: v.string(),
      state: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const title = `Delivery Update - Order ${args.order_number}`;
    const message = args.delivery_time
      ? `Your order will be delivered at ${args.delivery_time}`
      : "Your order is out for delivery";

    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      type: "delivery",
      title,
      message,
      data: {
        order_id: args.order_id,
        order_number: args.order_number,
        delivery_time: args.delivery_time,
        delivery_address: args.delivery_address,
      },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

// Get notification statistics
export const getNotificationStats = query({
  args: {
    user_id: v.optional(v.id("users")),
    start_date: v.optional(v.number()),
    end_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let notifications = await ctx.db.query("notifications").collect();

    // Filter by user
    if (args.user_id) {
      notifications = notifications.filter(
        (notification) => notification.user_id === args.user_id,
      );
    }

    // Filter by date range
    if (args.start_date) {
      notifications = notifications.filter(
        (notification) => notification.created_at >= args.start_date!,
      );
    }
    if (args.end_date) {
      notifications = notifications.filter(
        (notification) => notification.created_at <= args.end_date!,
      );
    }

    const stats = {
      total_notifications: notifications.length,
      unread_notifications: notifications.filter((n) => !n.is_read).length,
      sent_notifications: notifications.filter((n) => n.is_sent).length,
      order_update_notifications: notifications.filter(
        (n) => n.type === "order_update",
      ).length,
      promotion_notifications: notifications.filter(
        (n) => n.type === "promotion",
      ).length,
      system_notifications: notifications.filter((n) => n.type === "system")
        .length,
      delivery_notifications: notifications.filter((n) => n.type === "delivery")
        .length,
    };

    return stats;
  },
});

// Delete old notifications
export const deleteOldNotifications = mutation({
  args: {
    older_than_days: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.older_than_days * 24 * 60 * 60 * 1000;

    const oldNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.lt(q.field("created_at"), cutoffDate))
      .collect();

    await Promise.all(
      oldNotifications.map((notification) => ctx.db.delete(notification._id)),
    );

    return oldNotifications.length;
  },
});
