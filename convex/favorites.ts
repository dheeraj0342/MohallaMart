import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// Toggle favorite status for a product
export const toggleFavoriteProduct = mutation({
  args: {
    product_id: v.id("products"),
    user_id: v.union(v.id("users"), v.string()), // Accept both Convex ID or Supabase ID
  },
  handler: async (ctx, args) => {
    // Resolve Convex user ID from Supabase ID if needed
    let convexUserId: Id<"users">;
    if (typeof args.user_id === "string") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("id", args.user_id as string))
        .first();
      if (!user) {
        throw new Error("User not found");
      }
      convexUserId = user._id;
    } else {
      convexUserId = args.user_id;
    }

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) =>
        q.eq("user_id", convexUserId).eq("product_id", args.product_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("favorites", {
        user_id: convexUserId,
        product_id: args.product_id,
        created_at: Date.now(),
      });
      return true; // Added
    }
  },
});

// Toggle favorite status for a shop
export const toggleFavoriteShop = mutation({
  args: {
    shop_id: v.id("shops"),
    user_id: v.union(v.id("users"), v.string()), // Accept both Convex ID or Supabase ID
  },
  handler: async (ctx, args) => {
    // Resolve Convex user ID from Supabase ID if needed
    let convexUserId: Id<"users">;
    if (typeof args.user_id === "string") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("id", args.user_id as string))
        .first();
      if (!user) {
        throw new Error("User not found");
      }
      convexUserId = user._id;
    } else {
      convexUserId = args.user_id;
    }

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_shop", (q) =>
        q.eq("user_id", convexUserId).eq("shop_id", args.shop_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("favorites", {
        user_id: convexUserId,
        shop_id: args.shop_id,
        created_at: Date.now(),
      });
      return true; // Added
    }
  },
});

// Get all favorites for a user
export const getFavorites = query({
  args: { user_id: v.union(v.id("users"), v.string()) }, // Accept both Convex ID or Supabase ID
  handler: async (ctx, args) => {
    // Resolve Convex user ID from Supabase ID if needed
    let convexUserId: Id<"users">;
    if (typeof args.user_id === "string") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("id", args.user_id as string))
        .first();
      if (!user) {
        return { products: [], shops: [] };
      }
      convexUserId = user._id;
    } else {
      convexUserId = args.user_id;
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("user_id", convexUserId))
      .collect();

    // Fetch details for products and shops
    const favoriteProducts = [];
    const favoriteShops = [];

    for (const fav of favorites) {
      if (fav.product_id) {
        const product = await ctx.db.get(fav.product_id);
        if (product) favoriteProducts.push(product);
      }
      if (fav.shop_id) {
        const shop = await ctx.db.get(fav.shop_id);
        if (shop) favoriteShops.push(shop);
      }
    }

    return {
      products: favoriteProducts,
      shops: favoriteShops,
    };
  },
});

// Check if a specific item is favorited
export const isFavorite = query({
  args: {
    user_id: v.union(v.id("users"), v.string()), // Accept both Convex ID or Supabase ID
    product_id: v.optional(v.id("products")),
    shop_id: v.optional(v.id("shops")),
  },
  handler: async (ctx, args) => {
    // Resolve Convex user ID from Supabase ID if needed
    let convexUserId: Id<"users">;
    if (typeof args.user_id === "string") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id", (q) => q.eq("id", args.user_id as string))
        .first();
      if (!user) {
        return false;
      }
      convexUserId = user._id;
    } else {
      convexUserId = args.user_id;
    }

    if (args.product_id) {
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_product", (q) =>
          q.eq("user_id", convexUserId).eq("product_id", args.product_id!)
        )
        .first();
      return !!existing;
    }
    if (args.shop_id) {
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_shop", (q) =>
          q.eq("user_id", convexUserId).eq("shop_id", args.shop_id!)
        )
        .first();
      return !!existing;
    }
    return false;
  },
});
