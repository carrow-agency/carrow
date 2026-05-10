import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminUser } from "./access";
import { Id } from "./_generated/dataModel";

/**
 * Log an admin action to the immutable audit trail.
 * Call this from other mutations after completing the primary action.
 */
export const create = mutation({
  args: {
    action: v.string(),
    targetId: v.optional(v.string()),
    targetType: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdminUser(ctx);
    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: args.action,
      targetId: args.targetId,
      targetType: args.targetType,
      metadata: args.metadata,
      createdAt: new Date().toISOString(),
    });
  },
});

/**
 * List all audit logs, newest first. Admin only.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

/**
 * Filter audit logs by admin user.
 */
export const listByAdmin = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
      .order("desc")
      .take(200);
  },
});

/**
 * Filter audit logs by action type (e.g. "order.activate").
 */
export const listByAction = query({
  args: { action: v.string() },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_action", (q) => q.eq("action", args.action))
      .order("desc")
      .take(200);
  },
});
