import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    const orders = await ctx.db.query("orders").order("desc").take(500);
    return orders;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("orders")
      .withIndex("by_clientId_and_date", (q) => q.eq("clientId", userId))
      .order("desc")
      .take(200);
  },
});

export const create = mutation({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const user = await ctx.db.get(userId);
    if (!user || !user.email) {
      throw new Error("User profile is incomplete");
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    const orderId = await ctx.db.insert("orders", {
      clientId: userId,
      clientName: user.name ?? "Unknown",
      clientEmail: user.email,
      plan: plan.name,
      date: new Date().toISOString().split("T")[0] || "2024-01-01",
      status: "Pending",
    });

    await ctx.db.patch(userId, { planId: args.planId, planStatus: "pending" });

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(v.literal("Pending"), v.literal("Active"), v.literal("Cancelled")),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }
    
    await ctx.db.patch(args.id, { status: args.status });

    if (args.status === "Active") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await ctx.db.patch(order.clientId, {
        planStatus: "active",
        planExpiry: expiryDate.toISOString().split("T")[0],
      });
    } else if (args.status === "Cancelled") {
      await ctx.db.patch(order.clientId, {
        planStatus: "none",
        planExpiry: "",
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const order = await ctx.db.get(args.id);
    if (!order) {
      throw new Error("Order not found");
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const allOrders = await ctx.db.query("orders").take(2000);
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_status_and_date", (q) => q.eq("status", "Pending"))
      .take(2000);
    const activeOrders = await ctx.db
      .query("orders")
      .withIndex("by_status_and_date", (q) => q.eq("status", "Active"))
      .take(2000);
    const cancelledOrders = await ctx.db
      .query("orders")
      .withIndex("by_status_and_date", (q) => q.eq("status", "Cancelled"))
      .take(2000);

    return {
      totalOrders: allOrders.length,
      pendingOrders: pendingOrders.length,
      activeOrders: activeOrders.length,
      cancelledOrders: cancelledOrders.length,
    };
  },
});
