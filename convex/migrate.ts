import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const migrateData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Migrate settings to have singletonKey
    const settings = await ctx.db.query("settings").collect();
    for (const setting of settings) {
      if (!setting.singletonKey) {
        await ctx.db.patch(setting._id, { singletonKey: "default" });
      }
    }

    // 2. Migrate workMedia to have Id<"_storage">
    const mediaList = await ctx.db.query("workMedia").collect();
    for (const media of mediaList) {
      if (typeof media.storageId === "string") {
        try {
          // Verify it's a valid ID before casting
          const storageId = media.storageId as Id<"_storage">;
          await ctx.db.patch(media._id, { storageId });
        } catch (e) {
          console.error("Invalid storageId in workMedia", media._id);
        }
      }
    }

    // 3. Migrate monthlyReports numeric fields
    const reports = await ctx.db.query("monthlyReports").collect();
    const parseNum = (val: any) => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const num = parseInt(val.replace(/,/g, ''), 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    for (const report of reports) {
      const patchedReport: any = {};
      let needsPatch = false;

      if (report.kpiCards) {
        patchedReport.kpiCards = {
          totalViews: parseNum(report.kpiCards.totalViews),
          accountsReached: parseNum(report.kpiCards.accountsReached),
          totalInteractions: parseNum(report.kpiCards.totalInteractions),
          profileVisits: parseNum(report.kpiCards.profileVisits),
          totalContentPosted: parseNum(report.kpiCards.totalContentPosted),
        };
        needsPatch = true;
      }

      if (report.engagement) {
        patchedReport.engagement = {
          likes: parseNum(report.engagement.likes),
          comments: parseNum(report.engagement.comments),
          shares: parseNum(report.engagement.shares),
          saves: parseNum(report.engagement.saves),
        };
        needsPatch = true;
      }

      if (report.topReels) {
        patchedReport.topReels = report.topReels.map((r: any) => ({
          ...r,
          views: parseNum(r.views),
        }));
        needsPatch = true;
      }

      if (report.topPosts) {
        patchedReport.topPosts = report.topPosts.map((p: any) => ({
          ...p,
          viewsOrReach: parseNum(p.viewsOrReach),
        }));
        needsPatch = true;
      }

      if (needsPatch) {
        await ctx.db.patch(report._id, patchedReport);
      }
    }

    return "Migration complete";
  },
});
