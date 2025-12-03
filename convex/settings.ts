import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("system_settings").collect();
    // Convert array to object for easier consumption
    const settingsMap: Record<string, unknown> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }
    return settingsMap;
  },
});

export const saveSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("system_settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updated_at: Date.now(),
      });
    } else {
      await ctx.db.insert("system_settings", {
        key: args.key,
        value: args.value,
        description: args.description,
        updated_at: Date.now(),
      });
    }
  },
});
