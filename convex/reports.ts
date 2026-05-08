import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").collect();
    return reports;
  },
});

export const getByClient = query({
  args: { clientId: v.id("users") },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .filter(q => q.eq(q.field("clientId"), args.clientId))
      .collect();
    return reports;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    value: v.number(),
    trend: v.optional(v.number()),
    period: v.string(),
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const reportId = await ctx.db.insert("reports", {
      title: args.title,
      value: args.value,
      trend: args.trend,
      period: args.period,
      clientId: args.clientId,
    });

    return reportId;
  },
});

export const update = mutation({
  args: {
    id: v.id("reports"),
    title: v.optional(v.string()),
    value: v.optional(v.number()),
    trend: v.optional(v.number()),
    period: v.optional(v.string()),
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
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});