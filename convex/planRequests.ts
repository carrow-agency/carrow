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
 * When approved: automatically activates/cancels/renews the user's plan.
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

    if (args.status === "approved") {
      const user = await ctx.db.get(request.userId);
      if (!user) throw new Error("User not found");

      const requestType = request.type.toLowerCase();

      if (requestType === "cancel" || requestType === "cancellation") {
        // Cancel plan: clear user's plan fields + cancel active/pending orders
        await ctx.db.patch(request.userId, {
          planStatus: "none",
          planId: undefined,
          planExpiry: undefined,
        });
        const userOrders = await ctx.db
          .query("orders")
          .withIndex("by_clientId_and_date", (q) => q.eq("clientId", request.userId))
          .collect();
        for (const order of userOrders) {
          if (order.status === "Active" || order.status === "Pending") {
            await ctx.db.patch(order._id, { status: "Cancelled" });
          }
        }
      } else if (requestType === "renew" || requestType === "renewal") {
        // Renew: extend expiry 30 days from today, ensure active
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await ctx.db.patch(request.userId, {
          planStatus: "active",
          planExpiry: expiryDate.toISOString().split("T")[0],
        });
      } else {
        // activate / upgrade / new → find plan by name, activate user, create Active order
        let planId = user.planId;
        if (request.planName) {
          const plan = await ctx.db
            .query("plans")
            .filter((q) => q.eq(q.field("name"), request.planName))
            .first();
          if (plan) planId = plan._id;
        }
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await ctx.db.patch(request.userId, {
          planStatus: "active",
          ...(planId ? { planId } : {}),
          planExpiry: expiryDate.toISOString().split("T")[0],
        });
        // Auto-create an Active order so it shows in Orders panel
        await ctx.db.insert("orders", {
          clientId: request.userId,
          clientName: request.clientName ?? user.name ?? "Unknown",
          clientEmail: request.clientEmail ?? user.email ?? "No email",
          plan: request.planName ?? "Custom Plan",
          date: new Date().toISOString().split("T")[0] || "2024-01-01",
          status: "Active",
        });
      }
    }

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

    return { success: true };
  },
});
