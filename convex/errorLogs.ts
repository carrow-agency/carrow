import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getCurrentUser } from "./access";

export const logError = mutation({
  args: {
    message: v.string(),
    stack: v.optional(v.string()),
    source: v.string(),
    url: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Only allow authenticated users to log errors
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error("Authentication required");
    }

    const errorId = await ctx.db.insert("errorLogs", {
      message: args.message.slice(0, 1000),
      stack: args.stack?.slice(0, 3000),
      source: args.source.slice(0, 100),
      url: args.url?.slice(0, 500),
      userId: currentUser._id,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
    return { success: true, errorId };
  },
});

export const listErrorLogs = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    const logs = await ctx.db.query("errorLogs")
      .order("desc")
      .take(100);
    
    return logs;
  },
});

export const listUnresolvedErrors = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    const logs = await ctx.db.query("errorLogs")
      .withIndex("by_resolved_and_timestamp", (q) => q.eq("resolved", false))
      .order("desc")
      .take(100);
    
    return logs;
  },
});

export const resolveError = mutation({
  args: { id: v.id("errorLogs") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    await ctx.db.patch(args.id, { resolved: true });
    return { success: true };
  },
});

export const deleteError = mutation({
  args: { id: v.id("errorLogs") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getErrorStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    const allLogs = await ctx.db.query("errorLogs").take(2000);
    const unresolvedLogs = await ctx.db
      .query("errorLogs")
      .withIndex("by_resolved_and_timestamp", (q) => q.eq("resolved", false))
      .take(2000);
    const frontendLogs = await ctx.db
      .query("errorLogs")
      .withIndex("by_source_and_timestamp", (q) => q.eq("source", "frontend"))
      .take(2000);
    const backendLogs = await ctx.db
      .query("errorLogs")
      .withIndex("by_source_and_timestamp", (q) => q.eq("source", "backend"))
      .take(2000);

    return {
      total: allLogs.length,
      unresolved: unresolvedLogs.length,
      frontend: frontendLogs.length,
      backend: backendLogs.length,
    };
  },
});
