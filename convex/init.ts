import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./access";

export const setupDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings) {
      await ctx.db.insert("settings", {
        general: { siteName: 'Carrow', tagline: 'We Build Brands That Stand Out', email: 'hello@carrow.com', whatsapp: '' },
        home: { h1: 'Digital Marketing Studio.', h2: 'Scaling ambitious brands.', cta1: 'View Services', cta2: 'Our Work' }
      });
    }

    const existingPlans = await ctx.db.query("plans").first();
    if (!existingPlans) {
      await ctx.db.insert("plans", { name: "Basic", price: "Contact Us", features: ["Brand audit", "2 platforms", "8 content pieces", "WhatsApp support"], isPopular: false, visibility: true, tagline: "For starters" });
      await ctx.db.insert("plans", { name: "Pro", price: "Contact Us", features: ["Everything in Basic", "4 platforms", "20 content pieces", "Paid ads"], isPopular: true, visibility: true, tagline: "For growing brands" });
      await ctx.db.insert("plans", { name: "Enterprise", price: "Contact Us", features: ["Everything in Pro", "Unlimited platforms", "50+ content pieces", "Dedicated manager"], isPopular: false, visibility: true, tagline: "Full dominance" });
    }

    return "Defaults seeded successfully!";
  }
});

export const setAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await requireAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Admin access required");
    }
    
    const user = await ctx.db.query("users").withIndex("email", q => q.eq("email", args.email)).first();
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.role === "admin") {
      throw new Error("User is already an admin");
    }
    
    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, message: `Elevated ${args.email} to admin` };
  }
});