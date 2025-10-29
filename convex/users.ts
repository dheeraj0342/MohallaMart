import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new user
export const createUser = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("customer"),
        v.literal("shop_owner"),
        v.literal("admin"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      id: args.id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      avatar_url: args.avatar_url,
      role: args.role || "customer",
      is_active: true,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return userId;
  },
});

// Get user by ID
export const getUser = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
  },
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update user
export const updateUser = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("customer"),
        v.literal("shop_owner"),
        v.literal("admin"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      ...(args.name && { name: args.name }),
      ...(args.email && { email: args.email }),
      ...(args.phone !== undefined && { phone: args.phone }),
      ...(args.avatar_url !== undefined && { avatar_url: args.avatar_url }),
      ...(args.role && { role: args.role }),
      updated_at: Date.now(),
    });

    return user._id;
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      is_active: false,
      updated_at: Date.now(),
    });

    return user._id;
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("customer"),
        v.literal("shop_owner"),
        v.literal("admin"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let users;

    if (args.role) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q: any) => q.eq("role", args.role))
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
    }

    if (args.limit) {
      return users.slice(0, args.limit);
    }

    return users;
  },
});

// List shopkeepers with optional active filter
export const listShopkeepers = query({
  args: { is_active: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("users")
      .withIndex("by_role", (q: any) => q.eq("role", "shop_owner"))
      .collect();

    if (args.is_active !== undefined) {
      results = results.filter((u) => u.is_active === args.is_active);
    }

    return results;
  },
});

// List pending shopkeeper applications with applicant info
export const listPendingShopkeeperApplications = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("shopkeeper_applications")
      .withIndex("by_status", (q: any) => q.eq("status", "pending"))
      .collect();

    const results: Array<{
      applicationId: string;
      applicant: any;
      created_at: number;
    }> = [] as any;

    for (const app of pending) {
      const applicant = await ctx.db.get(app.applicant_id);
      if (applicant) {
        results.push({
          applicationId: app._id,
          applicant,
          created_at: app.created_at,
        });
      }
    }
    return results;
  },
});

// Set a user's active status (admin action)
export const setUserActiveStatus = mutation({
  args: { id: v.string(), is_active: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      is_active: args.is_active,
      updated_at: Date.now(),
    });

    // Update application status and write audit log
    const app = await ctx.db
      .query("shopkeeper_applications")
      .withIndex("by_applicant", (q: any) => q.eq("applicant_id", user._id))
      .first();

    if (app) {
      await ctx.db.patch(app._id, {
        status: args.is_active ? "approved" : "pending",
        updated_at: Date.now(),
      });
    }

    await ctx.db.insert("admin_audit_logs", {
      action: args.is_active ? "shopkeeper_approved" : "shopkeeper_disabled",
      target_user_id: user._id,
      performed_by: undefined,
      metadata: { prev_status: app?.status },
      created_at: Date.now(),
    });

    return user._id;
  },
});

// Request shopkeeper role (marks user as shop_owner but inactive until admin approves)
export const requestShopkeeperRole = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: "shop_owner",
      is_active: false,
      updated_at: Date.now(),
    });

    // Create or update a pending application
    const existingApp = await ctx.db
      .query("shopkeeper_applications")
      .withIndex("by_applicant", (q: any) => q.eq("applicant_id", user._id))
      .first();

    if (existingApp) {
      await ctx.db.patch(existingApp._id, {
        status: "pending",
        updated_at: Date.now(),
      });
    } else {
      await ctx.db.insert("shopkeeper_applications", {
        applicant_id: user._id,
        status: "pending",
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }

    return user._id;
  },
});

// Sync user with Supabase
export const syncUserWithSupabase = mutation({
  args: {
    supabaseUserId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("id"), args.supabaseUserId))
      .first();

    if (existingUser) {
      // Update existing user conservatively: do not overwrite user-edited fields
      const patch: any = {
        email: args.email,
        updated_at: Date.now(),
      };
      if (!existingUser.name && args.name) patch.name = args.name;
      if (existingUser.phone == null && args.phone !== undefined)
        patch.phone = args.phone;
      if (existingUser.avatar_url == null && args.avatar_url !== undefined)
        patch.avatar_url = args.avatar_url;
      await ctx.db.patch(existingUser._id, patch);
      return existingUser._id;
    } else {
      // Create new user
      const userId = await ctx.db.insert("users", {
        id: args.supabaseUserId,
        name: args.name,
        email: args.email,
        phone: args.phone,
        avatar_url: args.avatar_url,
        role: "customer",
        is_active: true,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      return userId;
    }
  },
});
