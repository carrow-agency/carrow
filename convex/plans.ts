import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_visibility", (q) => q.eq("visibility", true))
      .order("desc")
      .take(100);
    return plans;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    price: v.optional(v.string()),
    features: v.array(v.string()),
    isPopular: v.optional(v.boolean()),
    visibility: v.optional(v.boolean()),
    tagline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Plan name is required");
    }
    
    const planId = await ctx.db.insert("plans", {
      ...args,
      visibility: args.visibility ?? true,
    });
    return planId;
  },
});

export const update = mutation({
  args: {
    id: v.id("plans"),
    name: v.optional(v.string()),
    price: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    isPopular: v.optional(v.boolean()),
    visibility: v.optional(v.boolean()),
    tagline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const { id, ...updates } = args;
    const actualUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) actualUpdates[key] = value;
    }
    
    if (Object.keys(actualUpdates).length > 0) {
      await ctx.db.patch(id, actualUpdates);
    }
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("plans") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    await ctx.db.delete(args.id);
  },
});
