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
    role: v.optional(v.union(v.literal("customer"), v.literal("shop_owner"), v.literal("admin"))),
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
    role: v.optional(v.union(v.literal("customer"), v.literal("shop_owner"), v.literal("admin"))),
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
    role: v.optional(v.union(v.literal("customer"), v.literal("shop_owner"), v.literal("admin"))),
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
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        phone: args.phone,
        avatar_url: args.avatar_url,
        updated_at: Date.now(),
      });
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
