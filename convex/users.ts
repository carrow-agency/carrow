import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin, requireAuth, getCurrentUser } from "./access";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error(" unauthorized");
    }
    const users = await ctx.db.query("users").collect();
    return users.map(user => {
      const { passwordHash, ...safeUser } = user as any;
      return safeUser;
    });
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
    planId: v.optional(v.string()),
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
        actualUpdates[key] = value;
      }
    }
    
    if (Object.keys(actualUpdates).length > 0) {
      await ctx.db.patch(id, actualUpdates);
    }
    
    const updated = await ctx.db.get(id);
    if (!updated) return null;
    const { passwordHash, ...safeUser } = updated as any;
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
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});