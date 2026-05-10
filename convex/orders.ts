import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireAuth, requireAdminUser } from "./access";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    const ordersPage = await ctx.db.query("orders").order("desc").paginate(args.paginationOpts);
    
    const filteredOrders: typeof ordersPage.page = [];
    for (const order of ordersPage.page) {
      const user = await ctx.db.get(order.clientId);
      if (user?.role !== "admin") {
        filteredOrders.push(order);
      }
    }
    
    return {
      ...ordersPage,
      page: filteredOrders,
    };
  },
});

export const listMine = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return await ctx.db
      .query("orders")
      .withIndex("by_clientId_and_date", (q) => q.eq("clientId", userId))
      .order("desc")
      .paginate(args.paginationOpts);
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
    const admin = await requireAdminUser(ctx);

    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.id, { status: args.status });

    if (args.status === "Active") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      // Also look up planId by plan name if user doesn't have it set
      const user = await ctx.db.get(order.clientId);
      let planId = user?.planId;
      if (!planId && order.plan) {
        const plan = await ctx.db
          .query("plans")
          .filter((q) => q.eq(q.field("name"), order.plan))
          .first();
        if (plan) planId = plan._id;
      }
      await ctx.db.patch(order.clientId, {
        planStatus: "active",
        planExpiry: expiryDate.toISOString().split("T")[0],
        ...(planId ? { planId } : {}),
      });
    } else if (args.status === "Cancelled") {
      await ctx.db.patch(order.clientId, {
        planStatus: "cancelled",
        planExpiry: undefined,
      });
    }

    // Audit trail
    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: `order.${args.status.toLowerCase()}`,
      targetId: args.id,
      targetType: "orders",
      metadata: JSON.stringify({
        clientName: order.clientName,
        plan: order.plan,
        previousStatus: order.status,
      }),
      createdAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const admin = await requireAdminUser(ctx);

    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: "order.delete",
      targetId: args.id,
      targetType: "orders",
      metadata: JSON.stringify({ clientName: order.clientName, plan: order.plan }),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

/**
 * Renew an order — extends plan expiry by 30 days and re-activates if needed.
 */
export const renew = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const admin = await requireAdminUser(ctx);
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const newExpiry = expiryDate.toISOString().split("T")[0] || "2024-01-01";

    await ctx.db.patch(args.id, { status: "Active" });
    await ctx.db.patch(order.clientId, {
      planStatus: "active",
      planExpiry: newExpiry,
    });

    await ctx.db.insert("auditLogs", {
      adminId: admin._id,
      adminName: admin.name ?? "Admin",
      action: "order.renew",
      targetId: args.id,
      targetType: "orders",
      metadata: JSON.stringify({ clientName: order.clientName, plan: order.plan, newExpiry }),
      createdAt: new Date().toISOString(),
    });

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
