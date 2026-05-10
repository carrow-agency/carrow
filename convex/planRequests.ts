import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdminUser, getCurrentUser } from "./access";

const MAX_PLAN_REQUESTS_PER_WINDOW = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * List all plan requests — no N+1: clientName/clientEmail are denormalized at creation.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminUser(ctx);
    return await ctx.db.query("planRequests").order("desc").take(500);
  },
});

/**
 * Pending requests only — no N+1, uses index.
 */
export const getPending = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminUser(ctx);
    return await ctx.db
      .query("planRequests")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(500);
  },
});

/**
 * Create a plan request. Denormalizes client name/email at insert time.
 * Rate-limited: max 3 requests per hour per user.
 */
export const create = mutation({
  args: {
    type: v.string(),
    planName: v.optional(v.string()),
    previousPlan: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Authentication required");

    // Rate limiting: count pending requests created in the last hour
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
    const recentRequests = await ctx.db
      .query("planRequests")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", user._id).gt("createdAt", windowStart))
      .collect();

    if (recentRequests.length >= MAX_PLAN_REQUESTS_PER_WINDOW) {
      throw new Error("Too many plan requests. Please wait before submitting another.");
    }

    const requestId = await ctx.db.insert("planRequests", {
      userId: user._id,
      // Denormalized snapshot — no join needed on list queries
      clientName: user.name ?? "Unknown",
      clientEmail: user.email ?? "No email",
      type: args.type,
      planName: args.planName,
      previousPlan: args.previousPlan,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return requestId;
  },
});

/**
 * Update a request status. Admin only. Writes to audit log.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("planRequests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminUser(ctx);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Plan request not found");

    await ctx.db.patch(args.id, { status: args.status });

    // Audit trail
    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: `planRequest.${args.status}`,
      targetId: args.id,
      targetType: "planRequests",
      metadata: JSON.stringify({
        clientName: request.clientName,
        type: request.type,
        planName: request.planName,
      }),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

/**
 * Permanently remove a plan request record. Admin only.
 */
export const remove = mutation({
  args: { id: v.id("planRequests") },
  handler: async (ctx, args) => {
    const admin = await requireAdminUser(ctx);
    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Plan request not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: "planRequest.delete",
      targetId: args.id,
      targetType: "planRequests",
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
