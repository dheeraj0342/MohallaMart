import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a product review
export const createReview = mutation({
  args: {
    user_id: v.id("users"),
    product_id: v.id("products"),
    order_id: v.optional(v.id("orders")),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Verify order belongs to user and contains the product (if order_id provided)
    if (args.order_id) {
      const order = await ctx.db.get(args.order_id);
      if (!order || order.user_id !== args.user_id) {
        throw new Error("You can only review products from your own orders");
      }
      const hasProduct = order.items.some(
        (item: any) => item.product_id === args.product_id,
      );
      if (!hasProduct) {
        throw new Error("This product is not part of the specified order");
      }
    }

    // Check if user already reviewed this product for this order
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_order", (q) => q.eq("order_id", args.order_id || undefined))
      .collect();

    if (
      existing.some(
        (r) =>
          r.user_id === args.user_id &&
          r.product_id === args.product_id &&
          (!args.order_id || r.order_id === args.order_id),
      )
    ) {
      throw new Error("You have already reviewed this product");
    }

    const now = Date.now();

    const reviewId = await ctx.db.insert("reviews", {
      user_id: args.user_id,
      product_id: args.product_id,
      order_id: args.order_id,
      rating: args.rating,
      comment: args.comment,
      images: [],
      is_verified: !!args.order_id,
      created_at: now,
      updated_at: now,
    });

    // Recalculate product rating
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("product_id", args.product_id))
      .collect();

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await ctx.db.patch(args.product_id, {
      rating: Number(avgRating.toFixed(1)),
      updated_at: now,
    });

    return reviewId;
  },
});

// Get reviews for a product (with basic user info)
export const getReviewsByProduct = query({
  args: {
    product_id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("product_id", args.product_id))
      .order("desc")
      .collect();

    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
    const userMap = new Map<string, any>();

    for (const userId of userIds) {
      const user = await ctx.db.get(userId);
      if (user) {
        userMap.set(userId, { name: user.name });
      }
    }

    return reviews.map((review) => ({
      ...review,
      user: userMap.get(review.user_id) || null,
    }));
  },
});

// Get reviews by user
export const getReviewsByUser = query({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .order("desc")
      .collect();

    return reviews;
  },
});

// Shopkeeper/admin moderation: list reviews for a shop
export const getReviewsByShop = query({
  args: {
    shop_id: v.id("shops"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id))
      .order("desc")
      .collect();

    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
    const userMap = new Map<string, any>();

    for (const userId of userIds) {
      const user = await ctx.db.get(userId);
      if (user) {
        userMap.set(userId, { name: user.name, email: user.email });
      }
    }

    return reviews.map((review) => ({
      ...review,
      user: userMap.get(review.user_id) || null,
    }));
  },
});

// Delete review (for moderation)
export const deleteReview = mutation({
  args: {
    id: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.delete(args.id);

    // Recalculate product rating if product_id exists
    if (review.product_id) {
      const remaining = await ctx.db
        .query("reviews")
        .withIndex("by_product", (q) => q.eq("product_id", review.product_id!))
        .collect();

      const avgRating =
        remaining.length > 0
          ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
          : 0;

      await ctx.db.patch(review.product_id, {
        rating: Number(avgRating.toFixed(1)),
        updated_at: Date.now(),
      });
    }

    return args.id;
  },
});

// Reply to a review
export const replyToReview = mutation({
  args: {
    id: v.id("reviews"),
    reply: v.string(),
    shopkeeper_id: v.id("users"), // Verify ownership
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (!review) {
      throw new Error("Review not found");
    }

    if (!review.shop_id) {
      throw new Error("Review is not associated with a shop");
    }

    // Verify shopkeeper owns the shop
    const shop = await ctx.db.get(review.shop_id);
    if (!shop || shop.owner_id !== args.shopkeeper_id) {
      throw new Error("Unauthorized: You do not own this shop");
    }

    await ctx.db.patch(args.id, {
      reply: args.reply,
      replied_at: Date.now(),
    });

    // Notify user about reply
    await ctx.db.insert("notifications", {
      user_id: review.user_id,
      title: "Shopkeeper Replied",
      message: `${shop.name} replied to your review.`,
      type: "SYSTEM",
      data: { review_id: args.id },
      is_read: false,
      is_sent: false,
      created_at: Date.now(),
    });

    return args.id;
  },
});


