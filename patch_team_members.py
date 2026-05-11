import re

with open("convex/teamMembers.ts", "r") as f:
    content = f.read()

# Add getFileUrl mutation
if "export const getFileUrl" not in content:
    content += """
export const getFileUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  }
});
"""

# Add updateOrder mutation
if "export const updateOrder" not in content:
    content += """
export const updateOrder = mutation({
  args: {
    updates: v.array(v.object({ id: v.id("teamMembers"), order: v.number() }))
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    for (const update of args.updates) {
      await ctx.db.patch(update.id, { order: update.order });
    }
  }
});
"""

# Keep list ordered by "order" then "name" or just "by_order". 
# The index "by_order" is on ["order"]. But it might not be properly populated for old data.
# list query currently: await ctx.db.query("teamMembers").withIndex("by_order").take(50);
# It might crash if order is undefined for old records. 

with open("convex/teamMembers.ts", "w") as f:
    f.write(content)
