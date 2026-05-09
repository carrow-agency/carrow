import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, getCurrentUser } from "./access";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
});

import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Unauthorized");
    }
    const paginatedUsers = await ctx.db.query("users").order("desc").paginate(args.paginationOpts);
    const nonAdminUsers = paginatedUsers.page.filter(u => u.role !== "admin");
    return {
      ...paginatedUsers,
      page: nonAdminUsers.map(user => {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      })
    };
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    const targetUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    
    if (!targetUser) return null;
    
    const isAdmin = user.role === "admin";
    const isSelf = user._id === targetUser._id;
    
    if (!isAdmin && !isSelf) {
      throw new Error("Unauthorized access");
    }
    
    const { passwordHash, ...safeUser } = targetUser;
    return safeUser;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Authentication required");
    }
    
    const targetUser = await ctx.db.get(args.id);
    if (!targetUser) return null;
    
    const isAdmin = user.role === "admin";
    const isSelf = user._id === targetUser._id;
    
    if (!isAdmin && !isSelf) {
      throw new Error("Unauthorized access");
    }
    
    const { passwordHash, ...safeUser } = targetUser;
    return safeUser;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    planId: v.optional(v.id("plans")),
    planStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("active"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    
    const targetUser = await ctx.db.get(args.id);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser._id === targetUser._id;
    
    if (!isAdmin && !isSelf) {
      throw new Error("Unauthorized to update this user");
    }
    
    const { id, ...updates } = args;
    const actualUpdates: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        if (key === "role" && !isAdmin) continue;
        if (key === "planId" && !isAdmin) continue;
        if (key === "planStatus" && !isAdmin) continue;
        if (key === "phone" && !isSelf) continue;
        if (key === "email" && !isAdmin) continue;
        actualUpdates[key] = value;
      }
    }
    
    if (Object.keys(actualUpdates).length > 0) {
      await ctx.db.patch(id, actualUpdates);
    }
    
    const updated = await ctx.db.get(id);
    if (!updated) return null;
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required to delete users");
    }
    
    const targetUser = await ctx.db.get(args.id);
    if (!targetUser) {
      throw new Error("User not found");
    }
    
    if (targetUser.role === "admin") {
      throw new Error("Cannot delete admin users");
    }
    
    // Cascade deletes for referential integrity
    const orders = await ctx.db.query("orders").withIndex("by_clientId_and_date", q => q.eq("clientId", args.id)).collect();
    for (const order of orders) await ctx.db.delete(order._id);
    
    const files = await ctx.db.query("clientFiles").withIndex("by_user", q => q.eq("userId", args.id)).collect();
    for (const file of files) await ctx.db.delete(file._id);

    const planRequests = await ctx.db.query("planRequests").withIndex("by_userId_and_createdAt", q => q.eq("userId", args.id)).collect();
    for (const req of planRequests) await ctx.db.delete(req._id);

    const contracts = await ctx.db.query("contracts").withIndex("by_clientId_and_createdAt", q => q.eq("clientId", args.id)).collect();
    for (const contract of contracts) await ctx.db.delete(contract._id);

    const reports = await ctx.db.query("reports").withIndex("by_clientId_and_period", q => q.eq("clientId", args.id)).collect();
    for (const report of reports) await ctx.db.delete(report._id);

    const works = await ctx.db.query("works").withIndex("by_clientId", q => q.eq("clientId", args.id)).collect();
    for (const work of works) await ctx.db.delete(work._id);

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
