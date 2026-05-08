import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getCurrentUser } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const contracts = await ctx.db.query("contracts").order("desc").collect();
    return contracts;
  },
});

export const getByClient = query({
  args: { clientId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.clientId) return [];
    const contracts = await ctx.db
      .query("contracts")
      .filter(q => q.eq(q.field("clientId"), args.clientId))
      .collect();
    return contracts;
  },
});

export const getGlobal = query({
  args: {},
  handler: async (ctx) => {
    const contracts = await ctx.db
      .query("contracts")
      .filter(q => q.eq(q.field("clientId"), undefined))
      .collect();
    return contracts;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    fileUrl: v.string(),
    clientId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const contractId = await ctx.db.insert("contracts", {
      title: args.title,
      type: args.type,
      fileUrl: args.fileUrl,
      clientId: args.clientId,
      createdAt: new Date().toISOString(),
    });

    return contractId;
  },
});

export const update = mutation({
  args: {
    id: v.id("contracts"),
    title: v.optional(v.string()),
    type: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
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
  args: { id: v.id("contracts") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});