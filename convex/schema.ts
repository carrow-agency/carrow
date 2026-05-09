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
    planId: v.optional(v.id("plans")),
    planStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("active"))),
    planExpiry: v.optional(v.string()),
    registered: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  orders: defineTable({
    clientId: v.id("users"),
    clientName: v.string(),
    clientEmail: v.string(),
    plan: v.string(),
    date: v.string(),
    status: v.union(v.literal("Pending"), v.literal("Active"), v.literal("Cancelled")),
  })
    .index("by_clientId_and_date", ["clientId", "date"])
    .index("by_status_and_date", ["status", "date"]),

  plans: defineTable({
    name: v.string(),
    price: v.optional(v.string()),
    features: v.array(v.string()),
    isPopular: v.optional(v.boolean()),
    visibility: v.optional(v.boolean()),
    tagline: v.optional(v.string()),
  }).index("by_visibility", ["visibility"]),

  works: defineTable({
    url: v.string(),
    title: v.string(),
    category: v.string(),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),
    published: v.optional(v.boolean()),
  })
    .index("by_published", ["published"])
    .index("by_clientId", ["clientId"]),

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
    userId: v.id("users"),
    storageId: v.id("_storage"),
    type: v.string(),
    name: v.string(),
    size: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  contracts: defineTable({
    title: v.string(),
    type: v.string(),
    fileUrl: v.string(),
    clientId: v.optional(v.id("users")),
    createdAt: v.string(),
  })
    .index("by_clientId_and_createdAt", ["clientId", "createdAt"])
    .index("by_createdAt", ["createdAt"]),

  reports: defineTable({
    title: v.string(),
    value: v.number(),
    trend: v.optional(v.number()),
    period: v.string(),
    clientId: v.id("users"),
  }).index("by_clientId_and_period", ["clientId", "period"]),

  planRequests: defineTable({
    userId: v.id("users"),
    type: v.string(),
    planName: v.optional(v.string()),
    previousPlan: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.string(),
  })
    .index("by_userId_and_createdAt", ["userId", "createdAt"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  errorLogs: defineTable({
    message: v.string(),
    stack: v.optional(v.string()),
    source: v.string(),
    url: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    timestamp: v.string(),
    resolved: v.optional(v.boolean()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_resolved_and_timestamp", ["resolved", "timestamp"])
    .index("by_source_and_timestamp", ["source", "timestamp"]),
});
