import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdminUser } from "./access";

// Public query to fetch approved reviews for a specific plan
export const getApprovedForPlan = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("planReviews")
      .withIndex("by_planId_and_status", (q) =>
        q.eq("planId", args.planId).eq("status", "approved")
      )
      .order("desc")
      .collect();
  },
});

// User mutation to submit a new review
export const submitReview = mutation({
  args: {
    planId: v.id("plans"),
    planName: v.string(),
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in to submit a review.");
    }
    
    // Attempt to match auth identity to our users table
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found in system.");
    }

    await ctx.db.insert("planReviews", {
      planId: args.planId,
      planName: args.planName,
      userId: user._id,
      userName: user.name ?? "Anonymous User",
      rating: args.rating,
      reviewText: args.reviewText,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Admin query to list all reviews across all plans
export const listAllAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminUser(ctx);
    return await ctx.db.query("planReviews").order("desc").collect();
  },
});

// Admin mutation to update the status of a review
export const updateStatus = mutation({
  args: {
    id: v.id("planReviews"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireAdminUser(ctx);
    
    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");

    await ctx.db.patch(args.id, { status: args.status });
    
    return { success: true };
  },
});
