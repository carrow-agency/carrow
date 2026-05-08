import { mutation } from "./_generated/server";
import { requireAdmin } from "./access";

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const users = await ctx.db.query("users" as any).collect();
    for (const doc of users) {
      await ctx.db.delete(doc._id);
    }
    return { success: true, deletedCount: users.length };
  },
});