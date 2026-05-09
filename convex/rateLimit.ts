import { v } from "convex/values";
import { mutation } from "./_generated/server";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const checkRateLimit = mutation({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_identifier", (q) => q.eq("identifier", args.identifier))
      .first();

    if (existing) {
      if (now - existing.lastAttempt > WINDOW_MS) {
        // Reset window
        await ctx.db.patch(existing._id, { attempts: 1, lastAttempt: now });
        return { allowed: true };
      } else {
        if (existing.attempts >= MAX_ATTEMPTS) {
          throw new Error("Too many attempts. Please try again in 15 minutes.");
        }
        await ctx.db.patch(existing._id, { attempts: existing.attempts + 1, lastAttempt: now });
        return { allowed: true };
      }
    } else {
      await ctx.db.insert("rateLimits", {
        identifier: args.identifier,
        attempts: 1,
        lastAttempt: now,
      });
      return { allowed: true };
    }
  },
});
