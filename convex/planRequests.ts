import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, getCurrentUser } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    return await ctx.db.query("planRequests").order("desc").take(500);
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    const requests = await ctx.db
      .query("planRequests")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(500);
    return requests;
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    planName: v.optional(v.string()),
    previousPlan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }

    const requestId = await ctx.db.insert("planRequests", {
      userId: user._id,
      type: args.type,
      planName: args.planName,
      previousPlan: args.previousPlan,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return requestId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("planRequests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.id, { status: args.status });
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("planRequests") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
