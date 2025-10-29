import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyRegistration = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.userId))
      .first();
    if (!user) return null;
    const existing = await ctx.db
      .query("seller_registrations")
      .withIndex("by_user", (q: any) => q.eq("user_id", user._id))
      .first();
    return existing || null;
  },
});

export const upsertMyRegistration = mutation({
  args: {
    userId: v.string(),
    pan: v.string(),
    gstin: v.optional(v.string()),
    bank: v.object({
      account_holder: v.string(),
      account_number: v.string(),
      ifsc: v.string(),
    }),
    address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    identity: v.object({
      type: v.union(
        v.literal("aadhaar"),
        v.literal("passport"),
        v.literal("voter_id"),
        v.literal("driver_license"),
      ),
      number: v.string(),
    }),
    business: v.object({
      type: v.union(
        v.literal("individual"),
        v.literal("proprietorship"),
        v.literal("partnership"),
        v.literal("company"),
      ),
      name: v.optional(v.string()),
      documents: v.optional(v.array(v.string())),
    }),
    pickup_address: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
    }),
    first_product: v.optional(
      v.object({ name: v.optional(v.string()), url: v.optional(v.string()) }),
    ),
    submit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.userId))
      .first();
    if (!user) throw new Error("User not found");

    const now = Date.now();
    const existing = await ctx.db
      .query("seller_registrations")
      .withIndex("by_user", (q: any) => q.eq("user_id", user._id))
      .first();

    const record = {
      user_id: user._id,
      pan: args.pan,
      gstin: args.gstin,
      bank: args.bank,
      address: args.address,
      identity: args.identity,
      business: args.business,
      pickup_address: args.pickup_address,
      first_product: args.first_product,
      status: args.submit ? "submitted" : existing?.status || "draft",
      updated_at: now,
      created_at: existing?.created_at || now,
    } as const;

    if (existing) {
      await ctx.db.patch(existing._id, record as any);
      return existing._id;
    }
    const id = await ctx.db.insert("seller_registrations", record as any);
    return id;
  },
});
