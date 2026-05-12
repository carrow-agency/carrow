import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getCurrentUser, requireAuth } from "./access";

import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    // Public portfolio: only published + NOT private (no clientId/isPrivate)
    const works = await ctx.db
      .query("works")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter out private (client-only) works
    const publicWorks = works.page.filter((w) => !w.isPrivate && !w.clientId);

    const pageWithUrls = await Promise.all(
      publicWorks.map(async (work) => {
        let resolvedUrl = work.url;
        if (work.url && !work.url.startsWith("http")) {
          resolvedUrl = await ctx.storage.getUrl(work.url) || work.url;
        }
        return { ...work, url: resolvedUrl };
      })
    );

    return { ...works, page: pageWithUrls };
  },
});

export const listAll = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    const works = await ctx.db.query("works").order("desc").paginate(args.paginationOpts);
    const pageWithUrls = await Promise.all(
      works.page.map(async (work) => {
        let resolvedUrl = work.url;
        if (work.url && !work.url.startsWith("http")) {
          resolvedUrl = await ctx.storage.getUrl(work.url) || work.url;
        }
        return { ...work, url: resolvedUrl };
      })
    );
    return { ...works, page: pageWithUrls };
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
      
    return await Promise.all(
      works.map(async (work) => {
        let resolvedUrl = work.url;
        if (work.url && !work.url.startsWith("http")) {
          resolvedUrl = await ctx.storage.getUrl(work.url) || work.url;
        }
        return { ...work, url: resolvedUrl };
      })
    );
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const works = await ctx.db
      .query("works")
      .withIndex("by_clientId", (q) => q.eq("clientId", userId))
      .order("desc")
      .take(300);
      
    return await Promise.all(
      works.map(async (work) => {
        let resolvedUrl = work.url;
        if (work.url && !work.url.startsWith("http")) {
          resolvedUrl = await ctx.storage.getUrl(work.url) || work.url;
        }
        return { ...work, url: resolvedUrl };
      })
    );
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    category: v.string(),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
    isPrivate: v.optional(v.boolean()),
    published: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    instagram: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    if (!args.url || !args.title || !args.category) throw new Error("URL, title, and category are required");
    return await ctx.db.insert("works", {
      url: args.url,
      title: args.title,
      category: args.category,
      client: args.client,
      clientId: args.clientId,
      isPrivate: args.clientId ? true : (args.isPrivate ?? false),
      published: args.published ?? true,
      phone: args.phone,
      instagram: args.instagram,
      location: args.location,
    });
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
    isPrivate: v.optional(v.boolean()),
    published: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    instagram: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");

    const { id, ...updates } = args;

    if (updates.url !== undefined) {
      const existing = await ctx.db.get(id);
      if (existing && existing.url && !existing.url.startsWith("http") && existing.url !== updates.url) {
        try { await ctx.storage.delete(existing.url as any); } catch (e) { console.error(e); }
      }
    }

    const actualUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) actualUpdates[key] = value;
    }
    // auto-set isPrivate when clientId changes
    if (updates.clientId !== undefined) {
      actualUpdates.isPrivate = !!updates.clientId;
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

    const work = await ctx.db.get(args.id);
    if (work && work.url && !work.url.startsWith("http")) {
      // Delete the associated storage file
      try {
        await ctx.storage.delete(work.url as any);
      } catch (e) {
        console.error("Failed to delete portfolio media", e);
      }
    }

    await ctx.db.delete(args.id);
  },
});
