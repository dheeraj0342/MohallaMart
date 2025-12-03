import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggle favorite status for a product
export const toggleFavoriteProduct = mutation({
  args: {
    product_id: v.id("products"),
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_product", (q) =>
        q.eq("user_id", args.user_id).eq("product_id", args.product_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("favorites", {
        user_id: args.user_id,
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
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_shop", (q) =>
        q.eq("user_id", args.user_id).eq("shop_id", args.shop_id)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("favorites", {
        user_id: args.user_id,
        shop_id: args.shop_id,
        created_at: Date.now(),
      });
      return true; // Added
    }
  },
});

// Get all favorites for a user
export const getFavorites = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
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
    user_id: v.id("users"),
    product_id: v.optional(v.id("products")),
    shop_id: v.optional(v.id("shops")),
  },
  handler: async (ctx, args) => {
    if (args.product_id) {
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_product", (q) =>
          q.eq("user_id", args.user_id).eq("product_id", args.product_id!)
        )
        .first();
      return !!existing;
    }
    if (args.shop_id) {
      const existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_shop", (q) =>
          q.eq("user_id", args.user_id).eq("shop_id", args.shop_id!)
        )
        .first();
      return !!existing;
    }
    return false;
  },
});
