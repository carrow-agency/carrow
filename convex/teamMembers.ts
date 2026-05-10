import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teamMembers").withIndex("by_order").take(50);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    tag: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    return await ctx.db.insert("teamMembers", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("teamMembers"),
    name: v.string(),
    role: v.string(),
    tag: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    await ctx.db.patch(id, rest);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("teamMembers") },
  handler: async (ctx, { id }) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    await ctx.db.delete(id);
  },
});
