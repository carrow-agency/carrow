import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth, getCurrentUser } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    const orders = await ctx.db.query("orders").order("desc").collect();
    return orders;
  },
});

export const create = mutation({
  args: {
    clientId: v.id("users"),
    clientName: v.string(),
    clientEmail: v.string(),
    planId: v.id("plans"),
    planName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    
    if (args.clientId !== userId) {
      throw new Error("Can only create orders for yourself");
    }
    
    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("Plan not found");
    }
    
    const orderId = await ctx.db.insert("orders", {
      clientId: args.clientId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      plan: args.planName,
      date: new Date().toISOString().split("T")[0] || "2024-01-01",
      status: "Pending",
    });
    
    await ctx.db.patch(args.clientId, {
      planId: args.planId,
      planStatus: "pending",
    });
    
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
      
      await ctx.db.patch(order.clientId as any, {
        planStatus: "active",
        planExpiry: expiryDate.toISOString().split("T")[0],
      });
    } else if (args.status === "Cancelled") {
      await ctx.db.patch(order.clientId as any, {
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
    
    const allOrders = await ctx.db.query("orders").collect();
    
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === "Pending").length;
    const activeOrders = allOrders.filter(o => o.status === "Active").length;
    const cancelledOrders = allOrders.filter(o => o.status === "Cancelled").length;
    
    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      cancelledOrders,
    };
  },
});