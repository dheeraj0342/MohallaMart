import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new notification
 */
export const createNotification = mutation({
  args: {
    user_id: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("ORDER"),
      v.literal("DELIVERY"),
      v.literal("PAYMENT"),
      v.literal("SYSTEM"),
    ),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      user_id: args.user_id,
      title: args.title,
      message: args.message,
      type: args.type,
      data: args.data,
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return notificationId;
  },
});

/**
 * Get notifications for a user
 */
export const getNotifications = query({
  args: {
    user_id: v.id("users"),
    limit: v.optional(v.number()),
    unread_only: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id));

    if (args.unread_only) {
      query = query.filter((q) => q.eq(q.field("is_read"), false));
    }

    const notifications = await query.order("desc").collect();

    if (args.limit) {
      return notifications.slice(0, args.limit);
    }

    return notifications;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("user_id", args.user_id).eq("is_read", false)
      )
      .collect();

    return notifications.length;
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      is_read: true,
    });

    return args.id;
  },
});

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("user_id", args.user_id).eq("is_read", false)
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        is_read: true,
      });
    }

    return notifications.length;
  },
});

/**
 * Delete notification
 */
export const deleteNotification = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
