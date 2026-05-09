import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createReport = mutation({
  args: {
    clientId: v.id("users"),
    monthYear: v.string(),
    kpiCards: v.object({
      totalViews: v.string(),
      accountsReached: v.string(),
      totalInteractions: v.string(),
      profileVisits: v.string(),
      totalContentPosted: v.string(),
    }),
    contentType: v.object({
      reels: v.number(),
      stories: v.number(),
      posts: v.number(),
    }),
    engagement: v.object({
      likes: v.string(),
      comments: v.string(),
      shares: v.string(),
      saves: v.string(),
    }),
    topReels: v.array(v.object({
      thumbnailUrl: v.string(),
      views: v.string(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    topPosts: v.array(v.object({
      thumbnailUrl: v.string(),
      viewsOrReach: v.string(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    strategicInsights: v.object({
      performanceSummary: v.string(),
      bestContentType: v.string(),
      growthOpportunity: v.string(),
    }),
    previousMonth: v.optional(v.object({
      views: v.string(),
      reach: v.string(),
      interactions: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Only admins can create reports");

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const user = await ctx.db.get(userId);
    // Allow users to see their own reports, or admins to see anyone's reports
    if (user?.role !== "admin" && userId !== args.clientId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("monthlyReports")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

export const deleteReport = mutation({
  args: {
    id: v.id("monthlyReports"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Only admins can delete reports");

    await ctx.db.delete(args.id);
  },
});
