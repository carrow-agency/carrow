import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./access";

export const createReport = mutation({
  args: {
    clientId: v.id("users"),
    monthYear: v.string(),
    kpiCards: v.object({
      totalViews: v.number(),
      accountsReached: v.number(),
      totalInteractions: v.number(),
      profileVisits: v.number(),
      totalContentPosted: v.number(),
    }),
    contentType: v.object({
      reels: v.number(),
      stories: v.number(),
      posts: v.number(),
    }),
    engagement: v.object({
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    }),
    topReels: v.array(v.object({
      thumbnailStorageId: v.optional(v.id("_storage")),
      views: v.number(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    topPosts: v.array(v.object({
      thumbnailStorageId: v.optional(v.id("_storage")),
      viewsOrReach: v.number(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    strategicInsights: v.object({
      performanceSummary: v.string(),
      bestContentType: v.string(),
      growthOpportunity: v.string(),
    }),
    previousMonth: v.optional(v.object({
      views: v.number(),
      reach: v.number(),
      interactions: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");
    if (currentUser.role !== "admin") throw new Error("Only admins can create reports");

    // Prevent duplicate month/year for the same client
    const existing = await ctx.db
      .query("monthlyReports")
      .withIndex("by_clientId_and_monthYear", (q) =>
        q.eq("clientId", args.clientId).eq("monthYear", args.monthYear)
      )
      .first();

    if (existing) {
      throw new Error(`A report for ${args.monthYear} already exists for this client. Delete the existing one first.`);
    }

    return await ctx.db.insert("monthlyReports", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const getReportsByUser = query({
  args: {
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // Users can only see their own reports; admins see anyone's
    if (currentUser.role !== "admin" && currentUser._id !== args.clientId) {
      throw new Error("Unauthorized");
    }

    const reports = await ctx.db
      .query("monthlyReports")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    // Resolve thumbnail URLs from storage
    const reportsWithUrls = await Promise.all(
      reports.map(async (report) => {
        const topReels = await Promise.all(
          report.topReels.map(async (reel) => ({
            ...reel,
            thumbnailUrl: reel.thumbnailStorageId
              ? await ctx.storage.getUrl(reel.thumbnailStorageId)
              : null,
          }))
        );
        const topPosts = await Promise.all(
          report.topPosts.map(async (post) => ({
            ...post,
            thumbnailUrl: post.thumbnailStorageId
              ? await ctx.storage.getUrl(post.thumbnailStorageId)
              : null,
          }))
        );
        return { ...report, topReels, topPosts };
      })
    );

    return reportsWithUrls;
  },
});

export const deleteReport = mutation({
  args: {
    id: v.id("monthlyReports"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");
    if (currentUser.role !== "admin") throw new Error("Only admins can delete reports");

    // Also delete storage files for thumbnails
    const report = await ctx.db.get(args.id);
    if (report) {
      for (const reel of report.topReels) {
        if (reel.thumbnailStorageId) {
          try { await ctx.storage.delete(reel.thumbnailStorageId); } catch {}
        }
      }
      for (const post of report.topPosts) {
        if (post.thumbnailStorageId) {
          try { await ctx.storage.delete(post.thumbnailStorageId); } catch {}
        }
      }
    }

    await ctx.db.delete(args.id);
  },
});
