import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceKm(
  pointA: { lat: number; lng: number },
  pointB: { lat: number; lng: number },
): number {
  const dLat = toRadians(pointB.lat - pointA.lat);
  const dLng = toRadians(pointB.lng - pointA.lng);
  const lat1 = toRadians(pointA.lat);
  const lat2 = toRadians(pointB.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Create a new shop
export const createShop = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    owner_id: v.id("users"),
    categories: v.optional(v.array(v.id("categories"))),
    logo_url: v.optional(v.string()),
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
        saturday: v.optional(
          v.object({ open: v.string(), close: v.string() }),
        ),
        sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
      }),
    ),
    // Vendor-specific fields (optional, defaults provided)
    owner_name: v.optional(v.string()),
    shop_type: v.optional(v.string()),
    radius_km: v.optional(v.number()),
    delivery_profile: v.optional(
      v.object({
        base_prep_minutes: v.number(),
        max_parallel_orders: v.number(),
        buffer_minutes: v.number(),
        avg_rider_speed_kmph: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Get owner name from user if not provided
    let ownerName = args.owner_name;
    if (!ownerName) {
      const owner = await ctx.db.get(args.owner_id);
      ownerName = owner?.name || "Shop Owner";
    }

    // Default delivery profile
    const defaultDeliveryProfile = {
      base_prep_minutes: 5,
      max_parallel_orders: 3,
      buffer_minutes: 5,
      avg_rider_speed_kmph: 20,
    };

    // Check if user already has an active shop to prevent duplicates
    const existingShops = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.owner_id))
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    if (existingShops.length > 0) {
      // User already has a shop - update it instead of creating duplicate
      const existingShop = existingShops[0];
      await ctx.db.patch(existingShop._id, {
        name: args.name,
        description: args.description,
        owner_name: ownerName,
        shop_type: args.shop_type,
        categories: args.categories || [],
        logo_url: args.logo_url,
        address: args.address,
        contact: args.contact,
        business_hours: args.business_hours,
        radius_km: args.radius_km ?? existingShop.radius_km ?? 2,
        delivery_profile: args.delivery_profile ?? existingShop.delivery_profile ?? defaultDeliveryProfile,
        updated_at: Date.now(),
      });
      return existingShop._id;
    }

    // No existing shop - create new one
    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      description: args.description,
      owner_id: args.owner_id,
      owner_name: ownerName || undefined,
      shop_type: args.shop_type || undefined,
      categories: args.categories || [],
      logo_url: args.logo_url,
      address: args.address,
      contact: args.contact,
      business_hours: args.business_hours,
      radius_km: args.radius_km ?? 2, // Default 2km radius
      delivery_profile: args.delivery_profile ?? defaultDeliveryProfile,
      is_verified: false, // Requires admin verification
      is_active: true,
      rating: 0,
      total_orders: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return shopId;
  },
});

// Search shops
export const searchShops = query({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    pincode: v.optional(v.string()),
    customer_location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    max_radius_km: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allShops = await ctx.db.query("shops").collect();
    let filtered = allShops;

    if (args.query) {
      const searchTerm = args.query.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchTerm) ||
          shop.description?.toLowerCase().includes(searchTerm),
      );
    }

    if (args.city) {
      filtered = filtered.filter((shop) => shop.address.city === args.city);
    }

    if (args.is_active !== undefined) {
      filtered = filtered.filter((shop) => shop.is_active === args.is_active);
    }

    const pincodeMatches = args.pincode
      ? filtered.filter((shop) => shop.address.pincode === args.pincode)
      : null;

    let finalShops = filtered;

    if (args.customer_location && args.max_radius_km !== undefined) {
      const radiusMatches = filtered.filter((shop) => {
        const coordinates = shop.address.coordinates;
        if (!coordinates) return false;
        const distance = calculateDistanceKm(
          { lat: coordinates.lat, lng: coordinates.lng },
          args.customer_location!,
        );
        return distance <= args.max_radius_km!;
      });

      if (radiusMatches.length > 0) {
        finalShops = radiusMatches;
        if (pincodeMatches && pincodeMatches.length > 0) {
          const seen = new Set(finalShops.map((shop) => shop._id));
          for (const shop of pincodeMatches) {
            if (!seen.has(shop._id)) {
              finalShops.push(shop);
            }
          }
        }
      } else if (pincodeMatches) {
        finalShops = pincodeMatches;
      } else {
        finalShops = [];
      }
    } else if (pincodeMatches) {
      finalShops = pincodeMatches;
    }

    finalShops.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    if (args.limit) {
      return finalShops.slice(0, args.limit);
    }

    return finalShops;
  },
});

// Get shop by ID
export const getShop = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get shop by slug (generated from name)
export const getShopBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Generate slug from shop name and find matching shop
    const allShops = await ctx.db
      .query("shops")
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    // Helper function to generate slug (must match client-side function)
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    };

    // Find shop with matching slug
    const shop = allShops.find((s) => generateSlug(s.name) === args.slug);
    return shop || null;
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

// Update shop
export const updateShop = mutation({
  args: {
    id: v.id("shops"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    shop_type: v.optional(v.string()),
    categories: v.optional(v.array(v.id("categories"))),
    logo_url: v.optional(v.string()),
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
    radius_km: v.optional(v.number()),
    delivery_profile: v.optional(
      v.object({
        base_prep_minutes: v.number(),
        max_parallel_orders: v.number(),
        buffer_minutes: v.number(),
        avg_rider_speed_kmph: v.number(),
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
      ...(args.shop_type && { shop_type: args.shop_type }),
      ...(args.categories !== undefined && { categories: args.categories }),
      ...(args.logo_url !== undefined && { logo_url: args.logo_url }),
      ...(args.address && { address: args.address }),
      ...(args.contact && { contact: args.contact }),
      ...(args.business_hours && { business_hours: args.business_hours }),
      ...(args.radius_km !== undefined && { radius_km: args.radius_km }),
      ...(args.delivery_profile && {
        delivery_profile: {
          base_prep_minutes: args.delivery_profile.base_prep_minutes,
          max_parallel_orders: args.delivery_profile.max_parallel_orders,
          buffer_minutes: args.delivery_profile.buffer_minutes,
          avg_rider_speed_kmph: args.delivery_profile.avg_rider_speed_kmph,
        },
      }),
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

// Delete a shop (for cleaning up duplicates)
export const deleteShop = mutation({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get(args.id);
    if (!shop) {
      throw new Error("Shop not found");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Get all duplicate shops for a user (keeps the first one, marks others as duplicates)
export const getDuplicateShops = query({
  args: { owner_id: v.id("users") },
  handler: async (ctx, args) => {
    const shops = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.owner_id))
      .filter((q) => q.eq(q.field("is_active"), true))
      .collect();

    if (shops.length <= 1) {
      return [];
    }

    // Sort by created_at to keep the oldest one
    shops.sort((a, b) => (a.created_at || 0) - (b.created_at || 0));

    // Return all except the first one (these are duplicates)
    return shops.slice(1);
  },
});

// Get shops by category (supports hierarchical filtering)
export const getShopsByCategory = query({
  args: {
    category_id: v.optional(v.id("categories")),
    category_name: v.optional(v.string()),
    city: v.optional(v.string()),
    pincode: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all categories first
    const allCategories = await ctx.db.query("categories").collect();
    
    // Find category by ID or name
    let categoryId: Id<"categories"> | undefined;
    if (args.category_id) {
      categoryId = args.category_id;
    } else if (args.category_name && args.category_name.toLowerCase() !== "all") {
      const category = allCategories.find(
        (cat) => cat.name.toLowerCase() === args.category_name?.toLowerCase()
      );
      if (category) {
        categoryId = category._id;
      }
    }

    // Get all shops
    let shops = await ctx.db.query("shops").collect();

    // Filter by category if specified (hierarchical: includes parent and child categories)
    if (categoryId) {
      // Get all category IDs to match (the selected category and its children)
      const categoryIdsToMatch = new Set<Id<"categories">>();
      categoryIdsToMatch.add(categoryId);

      // Add all child categories (sub and sub-sub)
      const addChildren = (parentId: Id<"categories">) => {
        const children = allCategories.filter(
          (cat) => cat.parent_id === parentId
        );
        for (const child of children) {
          categoryIdsToMatch.add(child._id);
          addChildren(child._id); // Recursively add grandchildren
        }
      };
      addChildren(categoryId);

      // Also include parent categories if this is a sub/sub-sub category
      let currentCategory = allCategories.find((cat) => cat._id === categoryId);
      while (currentCategory?.parent_id) {
        categoryIdsToMatch.add(currentCategory.parent_id);
        currentCategory = allCategories.find(
          (cat) => cat._id === currentCategory!.parent_id
        );
      }

      // Filter shops that have any of these categories
      shops = shops.filter(
        (shop) =>
          shop.categories &&
          shop.categories.some((catId) => categoryIdsToMatch.has(catId))
      );
    }

    // Filter by active status
    if (args.is_active !== undefined) {
      shops = shops.filter((shop) => shop.is_active === args.is_active);
    } else {
      // Default to active shops only
      shops = shops.filter((shop) => shop.is_active === true);
    }

    // Filter by city
    if (args.city) {
      shops = shops.filter((shop) => shop.address.city === args.city);
    }

    // Filter by pincode
    if (args.pincode) {
      shops = shops.filter((shop) => shop.address.pincode === args.pincode);
    }

    // Sort by rating
    shops.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Apply limit
    if (args.limit) {
      shops = shops.slice(0, args.limit);
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
    };

    return stats;
  },
});
