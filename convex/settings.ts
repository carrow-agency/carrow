import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./access";
import { sanitizeText } from "./utils";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_singletonKey", (q) => q.eq("singletonKey", "default"))
      .first();
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
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      youtube: v.optional(v.string()),
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
    
    // Type-safe update payload builder with sanitization
    const buildGeneral = (g: any) => ({
      siteName: g?.siteName ? sanitizeText(g.siteName) : "Carrow",
      tagline: g?.tagline ? sanitizeText(g.tagline) : undefined,
      email: g?.email ? sanitizeText(g.email) : undefined,
      whatsapp: g?.whatsapp ? sanitizeText(g.whatsapp) : undefined,
      instagram: g?.instagram ? sanitizeText(g.instagram) : undefined,
      facebook: g?.facebook ? sanitizeText(g.facebook) : undefined,
      youtube: g?.youtube ? sanitizeText(g.youtube) : undefined,
    });

    const buildHome = (h: any) => ({
      h1: sanitizeText(h.h1),
      h2: sanitizeText(h.h2),
      cta1: sanitizeText(h.cta1),
      cta2: sanitizeText(h.cta2),
    });

    const buildAbout = (a: any) => ({
      founderName: sanitizeText(a.founderName),
      founderRole: sanitizeText(a.founderRole),
      founderBio: sanitizeText(a.founderBio),
      founderImage: a.founderImage, // Allow raw for image URL/ID
    });

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_singletonKey", (q) => q.eq("singletonKey", "default"))
      .first();
    if (settings) {
      const updateData: {
        general?: ReturnType<typeof buildGeneral>;
        home?: ReturnType<typeof buildHome>;
        aboutPage?: ReturnType<typeof buildAbout>;
      } = {};
      
      if (args.general) updateData.general = buildGeneral(args.general);
      if (args.home) updateData.home = buildHome(args.home);
      if (args.aboutPage) updateData.aboutPage = buildAbout(args.aboutPage);
      
      await ctx.db.patch(settings._id, updateData);
      return settings._id;
    }

    const createdId = await ctx.db.insert("settings", {
      singletonKey: "default",
      general: args.general ? buildGeneral(args.general) : {
        siteName: "Carrow",
      },
      home: args.home ? buildHome(args.home) : undefined,
      aboutPage: args.aboutPage ? buildAbout(args.aboutPage) : undefined,
    });
    return createdId;
  },
});

export const clearSettings = mutation({
  args: {
    confirmationToken: v.string(),
  },
  handler: async (ctx, { confirmationToken }) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) throw new Error("Admin access required");
    if (confirmationToken !== "CLEAR") {
      throw new Error("Invalid confirmation token");
    }

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_singletonKey", (q) => q.eq("singletonKey", "default"))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }
  },
});
