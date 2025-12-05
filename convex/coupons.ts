import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCoupon = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    discount_type: v.union(v.literal("percentage"), v.literal("fixed")),
    discount_value: v.number(),
    min_order_amount: v.optional(v.number()),
    max_discount_amount: v.optional(v.number()),
    start_date: v.number(),
    end_date: v.number(),
    usage_limit: v.optional(v.number()),
    shop_id: v.id("shops"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .filter((q) => q.eq(q.field("shop_id"), args.shop_id))
      .first();

    if (existing) {
      throw new Error("Coupon code already exists for this shop");
    }

    await ctx.db.insert("coupons", {
      ...args,
      usage_count: 0,
      is_active: true,
      created_at: Date.now(),
    });
  },
});

export const getCouponsByShop = query({
  args: { shop_id: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_shop", (q) => q.eq("shop_id", args.shop_id))
      .order("desc")
      .collect();
  },
});

export const toggleCouponStatus = mutation({
  args: { id: v.id("coupons"), is_active: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { is_active: args.is_active });
  },
});

export const deleteCoupon = mutation({
  args: { id: v.id("coupons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
