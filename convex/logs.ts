import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Log a login attempt (primarily for failures)
export const logLoginAttempt = mutation({
  args: {
    email: v.string(),
    error_message: v.string(),
    status: v.union(v.literal("failed"), v.literal("success")),
    ip_address: v.optional(v.string()),
    user_agent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("login_logs", {
      email: args.email,
      error_message: args.error_message,
      status: args.status,
      ip_address: args.ip_address,
      user_agent: args.user_agent,
      created_at: Date.now(),
    });
  },
});
