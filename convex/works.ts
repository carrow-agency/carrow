import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getCurrentUser, requireAuth } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const works = await ctx.db
      .query("works")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(300);
    return works;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    const works = await ctx.db.query("works").order("desc").take(500);
    return works;
  },
});

export const getByClient = query({
  args: { clientId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    if (!args.clientId) {
      return [];
    }
    if (currentUser.role !== "admin" && currentUser._id !== args.clientId) {
      throw new Error("Unauthorized access");
    }
    const works = await ctx.db
      .query("works")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .take(300);
    return works;
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("works")
      .withIndex("by_clientId", (q) => q.eq("clientId", userId))
      .order("desc")
      .take(300);
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    category: v.string(),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    if (!args.url || !args.title || !args.category) {
      throw new Error("URL, title, and category are required");
    }

    const workId = await ctx.db.insert("works", {
      url: args.url,
      title: args.title,
      category: args.category,
      client: args.client,
      clientId: args.clientId,
      published: args.published ?? true,
    });
    return workId;
  },
});

export const update = mutation({
  args: {
    id: v.id("works"),
    url: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
    published: v.optional(v.boolean()),
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
  args: { id: v.id("works") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    await ctx.db.delete(args.id);
  },
});
