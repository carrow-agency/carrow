import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./access";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? null;
  },
});

export const update = mutation({
  args: {
    general: v.optional(v.object({
      siteName: v.optional(v.string()),
      tagline: v.optional(v.string()),
      email: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
    })),
    home: v.optional(v.object({
      h1: v.string(),
      h2: v.string(),
      cta1: v.string(),
      cta2: v.string(),
    })),
    aboutPage: v.optional(v.object({
      founderName: v.string(),
      founderRole: v.string(),
      founderBio: v.string(),
      founderImage: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const settings = await ctx.db.query("settings").first();
    if (settings) {
      const updateData: Record<string, unknown> = {};
      
      if (args.general) {
        updateData.general = args.general;
      }
      if (args.home) {
        updateData.home = args.home;
      }
      if (args.aboutPage !== undefined) {
        updateData.aboutPage = args.aboutPage;
      }
      
      await ctx.db.patch(settings._id, updateData);
      return settings._id;
    }

    const createdId = await ctx.db.insert("settings", {
      general: {
        siteName: args.general?.siteName ?? "Carrow",
        tagline: args.general?.tagline,
        email: args.general?.email,
        whatsapp: args.general?.whatsapp,
      },
      home: args.home,
      aboutPage: args.aboutPage,
    });
    return createdId;
  },
});
