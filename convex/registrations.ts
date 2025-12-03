import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Admin query to list all registrations
export const listAllRegistrations = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("reviewing"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    let registrationsQuery = ctx.db.query("seller_registrations");
    
    // Filter by status if provided
    if (args.status) {
      registrationsQuery = registrationsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }
    
    const registrations = await registrationsQuery.collect();
    
    // Fetch user details for each registration
    const registrationsWithUsers = await Promise.all(
      registrations.map(async (reg) => {
        const user = await ctx.db.get(reg.user_id);
        return {
          ...reg,
          user: user ? { id: user.id, name: user.name, email: user.email } : null,
        };
      })
    );
    
    return registrationsWithUsers;
  },
});

// Admin mutation to update registration status
export const updateRegistrationStatus = mutation({
  args: {
    registrationId: v.id("seller_registrations"),
    status: v.union(
      v.literal("reviewing"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db.get(args.registrationId);
    if (!registration) throw new Error("Registration not found");
    
    // Update registration status
    await ctx.db.patch(args.registrationId, {
      status: args.status,
      updated_at: Date.now(),
    });
    
    // If approved, update user role to shop_owner
    if (args.status === "approved") {
      const user = await ctx.db.get(registration.user_id);
      if (user && user.role !== "shop_owner") {
        await ctx.db.patch(registration.user_id, {
          role: "shop_owner",
          is_active: true,
        });
      }
    }
    
    // TODO: Send notification to user via email
    // You can implement email notification here using your email service
    
    return { success: true };
  },
});

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
      lat: v.optional(v.number()),
      lon: v.optional(v.number()),
      accuracy: v.optional(v.number()),
      snapped: v.optional(v.boolean()),
      source: v.optional(v.string()),
      village: v.optional(v.string()),
      hamlet: v.optional(v.string()),
      county: v.optional(v.string()),
      stateDistrict: v.optional(v.string()),
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
