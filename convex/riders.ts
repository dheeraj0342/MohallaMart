import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new rider
 */
export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    currentLocation: v.object({
      lat: v.number(),
      lon: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Check if rider already exists
    const existing = await ctx.db
      .query("riders")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existing) {
      throw new Error("Rider with this phone already exists");
    }

    const riderId = await ctx.db.insert("riders", {
      name: args.name,
      phone: args.phone,
      current_location: {
        lat: args.currentLocation.lat,
        lon: args.currentLocation.lon,
      },
      is_online: false,
      is_busy: false,
      updated_at: Date.now(),
      created_at: Date.now(),
    });

    return riderId;
  },
});

/**
 * Get all online riders
 */
export const getOnlineRiders = query({
  handler: async (ctx) => {
    const riders = await ctx.db
      .query("riders")
      .withIndex("by_online", (q) => q.eq("is_online", true))
      .collect();

    return riders;
  },
});

/**
 * Get available riders (online and not busy)
 */
export const getAvailableRiders = query({
  handler: async (ctx) => {
    const riders = await ctx.db
      .query("riders")
      .withIndex("by_online", (q) => q.eq("is_online", true))
      .collect();

    return riders.filter((rider) => !rider.is_busy);
  },
});

/**
 * Update rider location
 */
export const updateLocation = mutation({
  args: {
    id: v.id("riders"),
    location: v.object({
      lat: v.number(),
      lon: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      current_location: {
        lat: args.location.lat,
        lon: args.location.lon,
      },
      updated_at: Date.now(),
    });

    return args.id;
  },
});

/**
 * Update rider status
 */
export const updateStatus = mutation({
  args: {
    id: v.id("riders"),
    isOnline: v.optional(v.boolean()),
    isBusy: v.optional(v.boolean()),
    assignedOrderId: v.optional(v.union(v.id("orders"), v.null())),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updated_at: Date.now(),
    };

    if (args.isOnline !== undefined) updateData.is_online = args.isOnline;
    if (args.isBusy !== undefined) updateData.is_busy = args.isBusy;
    if (args.assignedOrderId !== undefined) {
      updateData.assigned_order_id = args.assignedOrderId;
    }

    await ctx.db.patch(args.id, updateData);
    return args.id;
  },
});

/**
 * Get rider by ID
 */
export const getById = query({
  args: { id: v.id("riders") },
  handler: async (ctx, args) => {
    const rider = await ctx.db.get(args.id);
    return rider;
  },
});

/**
 * Get rider by phone
 */
export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const rider = await ctx.db
      .query("riders")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    return rider;
  },
});

/**
 * Get all riders (for admin)
 */
export const getAllRiders = query({
  args: {},
  handler: async (ctx) => {
    const riders = await ctx.db.query("riders").collect();
    return riders;
  },
});

