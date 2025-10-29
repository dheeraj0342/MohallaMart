import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new shop
export const createShop = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    owner_id: v.id("users"),
    address: v.object({
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
    contact: v.object({
      phone: v.string(),
      email: v.optional(v.string()),
    }),
    business_hours: v.optional(
      v.object({
        monday: v.optional(v.object({ open: v.string(), close: v.string() })),
        tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
        wednesday: v.optional(
          v.object({ open: v.string(), close: v.string() }),
        ),
        thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
        friday: v.optional(v.object({ open: v.string(), close: v.string() })),
        saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
        sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      description: args.description,
      owner_id: args.owner_id,
      address: args.address,
      contact: args.contact,
      business_hours: args.business_hours,
      is_active: true,
      rating: 0,
      total_orders: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return shopId;
  },
});

// Get shop by ID
export const getShop = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get shops by owner
export const getShopsByOwner = query({
  args: {
    owner_id: v.id("users"),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.owner_id));

    if (args.is_active !== undefined) {
      query = query.filter((q) => q.eq(q.field("is_active"), args.is_active));
    }

    return await query.collect();
  },
});

// Get shops by city
export const getShopsByCity = query({
  args: {
    city: v.string(),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("shops")
      .withIndex("by_city", (q) => q.eq("address.city", args.city));

    if (args.is_active !== undefined) {
      query = query.filter((q) => q.eq(q.field("is_active"), args.is_active));
    }

    const shops = await query.collect();

    if (args.limit) {
      return shops.slice(0, args.limit);
    }

    return shops;
  },
});

// Get shops by pincode
export const getShopsByPincode = query({
  args: {
    pincode: v.string(),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("shops")
      .withIndex("by_pincode", (q) => q.eq("address.pincode", args.pincode));

    if (args.is_active !== undefined) {
      query = query.filter((q) => q.eq(q.field("is_active"), args.is_active));
    }

    const shops = await query.collect();

    if (args.limit) {
      return shops.slice(0, args.limit);
    }

    return shops;
  },
});

// Search shops
export const searchShops = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    pincode: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let shops = await ctx.db.query("shops").collect();

    // Filter by search query
    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      shops = shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm) ||
          shop.description?.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by city
    if (args.city) {
      shops = shops.filter((shop) => shop.address.city === args.city);
    }

    // Filter by pincode
    if (args.pincode) {
      shops = shops.filter((shop) => shop.address.pincode === args.pincode);
    }

    // Filter by active status
    if (args.is_active !== undefined) {
      shops = shops.filter((shop) => shop.is_active === args.is_active);
    }

    // Sort by rating
    shops.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (args.limit) {
      return shops.slice(0, args.limit);
    }

    return shops;
  },
});

// Update shop
export const updateShop = mutation({
  args: {
    id: v.id("shops"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(
      v.object({
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
    ),
    contact: v.optional(
      v.object({
        phone: v.string(),
        email: v.optional(v.string()),
      }),
    ),
    business_hours: v.optional(
      v.object({
        monday: v.optional(v.object({ open: v.string(), close: v.string() })),
        tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
        wednesday: v.optional(
          v.object({ open: v.string(), close: v.string() }),
        ),
        thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
        friday: v.optional(v.object({ open: v.string(), close: v.string() })),
        saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
        sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
      }),
    ),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.id);
    if (!shop) {
      throw new Error("Shop not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.address && { address: args.address }),
      ...(args.contact && { contact: args.contact }),
      ...(args.business_hours && { business_hours: args.business_hours }),
      ...(args.is_active !== undefined && { is_active: args.is_active }),
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Update shop rating
export const updateShopRating = mutation({
  args: {
    id: v.id("shops"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.id);
    if (!shop) {
      throw new Error("Shop not found");
    }

    await ctx.db.patch(args.id, {
      rating: args.rating,
      updated_at: Date.now(),
    });

    return args.id;
  },
});

// Get all active shops
export const getAllActiveShops = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const shops = await ctx.db
      .query("shops")
      .withIndex("by_active", (q) => q.eq("is_active", true))
      .collect();

    // Sort by rating
    shops.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (args.limit) {
      return shops.slice(0, args.limit);
    }

    return shops;
  },
});

// Get shop statistics
export const getShopStats = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.id);
    if (!shop) {
      throw new Error("Shop not found");
    }

    // Get orders for this shop
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.id))
      .collect();

    // Get products for this shop
    const products = await ctx.db
      .query("products")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.id))
      .collect();

    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
      total_products: products.length,
      available_products: products.filter((product) => product.is_available)
        .length,
      out_of_stock_products: products.filter(
        (product) => product.stock_quantity === 0,
      ).length,
      average_order_value:
        orders.length > 0
          ? orders.reduce((sum, order) => sum + order.total_amount, 0) /
            orders.length
          : 0,
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
    };

    return stats;
  },
});
