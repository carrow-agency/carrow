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
    const errorId = await ctx.db.insert("errorLogs", {
      message: args.message,
      stack: args.stack,
      source: args.source,
      url: args.url,
      userId: args.userId,
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
      .filter(q => q.eq(q.field("resolved"), false))
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
    
    const allLogs = await ctx.db.query("errorLogs").collect();
    const total = allLogs.length;
    const unresolved = allLogs.filter(l => !l.resolved).length;
    const frontend = allLogs.filter(l => l.source === "frontend").length;
    const backend = allLogs.filter(l => l.source === "backend").length;
    
    return { total, unresolved, frontend, backend };
  },
});