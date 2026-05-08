import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    passwordHash: v.optional(v.string()),
    planId: v.optional(v.string()),
    planStatus: v.optional(v.string()),
    planExpiry: v.optional(v.string()),
    registered: v.optional(v.string()),
    role: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  orders: defineTable({
    clientId: v.id("users"),
    clientName: v.string(),
    clientEmail: v.string(),
    plan: v.string(),
    date: v.string(),
    status: v.string(),
  }),

  plans: defineTable({
    name: v.string(),
    price: v.optional(v.string()),
    features: v.array(v.string()),
    isPopular: v.optional(v.boolean()),
    visibility: v.optional(v.boolean()),
    tagline: v.optional(v.string()),
  }),

  works: defineTable({
    url: v.string(),
    title: v.string(),
    category: v.string(),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
    published: v.optional(v.boolean()),
  }),

  settings: defineTable({
    general: v.object({
      siteName: v.string(),
      tagline: v.optional(v.string()),
      email: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
    }),
    home: v.optional(v.object({
      h1: v.string(),
      h2: v.string(),
      cta1: v.string(),
      cta2: v.string(),
    })),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  }),

  clientFiles: defineTable({
    userId: v.string(),
    storageId: v.id("_storage"),
    type: v.string(),
    name: v.string(),
    size: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  contracts: defineTable({
    title: v.string(),
    type: v.string(),
    fileUrl: v.string(),
    clientId: v.optional(v.id("users")),
    createdAt: v.string(),
  }),

  reports: defineTable({
    title: v.string(),
    value: v.number(),
    trend: v.optional(v.number()),
    period: v.string(),
    clientId: v.id("users"),
  }),
});