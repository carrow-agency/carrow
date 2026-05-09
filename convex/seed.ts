import { mutation } from "./_generated/server";

export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPlans = await ctx.db.query("plans").collect();
    if (existingPlans.length > 0) {
      return { message: "Plans already exist", count: existingPlans.length };
    }

    const planData = [
      { name: "Basic", price: "Contact Us", features: ["Brand audit", "2 platforms", "8 content pieces", "WhatsApp support"], isPopular: false, visibility: true, tagline: "For starters" },
      { name: "Pro", price: "Contact Us", features: ["Everything in Basic", "4 platforms", "20 content pieces", "Paid ads"], isPopular: true, visibility: true, tagline: "For growing brands" },
      { name: "Enterprise", price: "Contact Us", features: ["Everything in Pro", "Unlimited platforms", "50+ content pieces", "Dedicated manager"], isPopular: false, visibility: true, tagline: "Full dominance" },
    ];

    for (const p of planData) {
      await ctx.db.insert("plans", p);
    }

    return { message: "Plans seeded", count: planData.length };
  },
});

export const seedWorks = mutation({
  args: {},
  handler: async (ctx) => {
    const existingWorks = await ctx.db.query("works").collect();
    if (existingWorks.length > 0) {
      return { message: "Works already exist", count: existingWorks.length };
    }

    const workData = [
      { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", title: "Aura Skincare", category: "Brand Identity", client: "Aura Beauty", published: true },
      { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", title: "TechFlow Dashboard", category: "Web Design", client: "TechFlow Inc", published: true },
      { url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0", title: "Glow Up Campaign", category: "Social Media", client: "Glow Up Co", published: true },
    ];

    for (const w of workData) {
      await ctx.db.insert("works", w);
    }

    return { message: "Works seeded", count: workData.length };
  },
});

export const seedReports = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await ctx.db.query("users").filter(q => q.eq(q.field("email"), "admin@gmail.com")).first();
    if (!admin) return { message: "Admin not found" };

    const existingReports = await ctx.db.query("reports").withIndex("by_clientId_and_period", q => q.eq("clientId", admin._id)).collect();
    if (existingReports.length > 0) return { message: "Reports already exist" };

    const reportData = [
      { title: "Engagement", value: 12500, trend: 12, period: "2026-01", clientId: admin._id },
      { title: "Engagement", value: 14200, trend: 15, period: "2026-02", clientId: admin._id },
      { title: "Engagement", value: 16800, trend: 18, period: "2026-03", clientId: admin._id },
      { title: "Engagement", value: 15900, trend: -5, period: "2026-04", clientId: admin._id },
      { title: "Engagement", value: 19200, trend: 20, period: "2026-05", clientId: admin._id },
      { title: "Reach", value: 45000, trend: 8, period: "2026-05", clientId: admin._id },
      { title: "Conversions", value: 850, trend: 25, period: "2026-05", clientId: admin._id },
    ];

    for (const r of reportData) {
      await ctx.db.insert("reports", r);
    }

    return { message: "Reports seeded" };
  },
});