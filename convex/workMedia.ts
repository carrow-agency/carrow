import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./access";

// List all media for a given work entry
export const listByWork = query({
  args: { workId: v.id("works") },
  handler: async (ctx, { workId }) => {
    const media = await ctx.db
      .query("workMedia")
      .withIndex("by_workId", (q) => q.eq("workId", workId))
      .order("asc")
      .take(100);

    return await Promise.all(
      media.map(async (m) => {
        const url = await ctx.storage.getUrl(m.storageId as any);
        return { ...m, url: url ?? m.url };
      })
    );
  },
});

export const addMedia = mutation({
  args: {
    workId: v.id("works"),
    storageId: v.string(),
    type: v.string(),
    caption: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    return await ctx.db.insert("workMedia", {
      workId: args.workId,
      storageId: args.storageId,
      type: args.type,
      caption: args.caption,
      order: args.order,
    });
  },
});

export const removeMedia = mutation({
  args: { id: v.id("workMedia") },
  handler: async (ctx, { id }) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    const media = await ctx.db.get(id);
    if (media) {
      try { await ctx.storage.delete(media.storageId as any); } catch {}
    }
    await ctx.db.delete(id);
  },
});

export const updateCaption = mutation({
  args: { id: v.id("workMedia"), caption: v.string() },
  handler: async (ctx, { id, caption }) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    await ctx.db.patch(id, { caption });
  },
});
