import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const execute = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    if (!user) throw new Error("User not found: " + args.email);
    await ctx.db.patch(user._id, { role: "admin" });
    return "Promoted " + args.email;
  },
});
