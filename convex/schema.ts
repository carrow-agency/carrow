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
    planId: v.optional(v.id("plans")),
    planStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("active"), v.literal("cancelled"))),
    planExpiry: v.optional(v.number()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  userSecrets: defineTable({
    userId: v.id("users"),
    passwordHash: v.string(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    clientId: v.id("users"),
    clientName: v.string(),
    clientEmail: v.string(),
    business: v.string(),
    phone: v.string(),
    city: v.string(),
    plan: v.string(),
    date: v.number(),
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

  planReviews: defineTable({
    planId: v.id("plans"),
    planName: v.string(),
    userId: v.id("users"),
    userName: v.string(),
    rating: v.number(),
    reviewText: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.string(),
  })
    .index("by_planId_and_status", ["planId", "status"])
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),

  works: defineTable({
    url: v.string(),           // cover/thumbnail storageId or URL
    title: v.string(),
    category: v.string(),
    client: v.optional(v.string()),
    clientId: v.optional(v.id("users")),  // set → private (user-only), unset → public portfolio
    isPrivate: v.optional(v.boolean()),   // true = only visible in that user's dashboard
    published: v.optional(v.boolean()),
    phone: v.optional(v.string()),
    instagram: v.optional(v.string()),
    location: v.optional(v.string()),
  })
    .index("by_published", ["published"])
    .index("by_clientId", ["clientId"]),

  // Additional media files per portfolio project (multi-media per work)
  workMedia: defineTable({
    workId: v.id("works"),
    storageId: v.id("_storage"),      // Convex storageId
    url: v.optional(v.string()), // resolved URL (cached)
    type: v.string(),            // MIME type
    caption: v.optional(v.string()),
    order: v.optional(v.number()),
  }).index("by_workId", ["workId"]),

  settings: defineTable({
    singletonKey: v.optional(v.string()),
    general: v.object({
      siteName: v.string(),
      tagline: v.optional(v.string()),
      email: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      youtube: v.optional(v.string()),
    }),
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
  }).index("by_singletonKey", ["singletonKey"]),

  teamMembers: defineTable({
    name: v.string(),
    role: v.string(),
    tag: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
  }).index("by_order", ["order"]),

  // fileLabel: semantic category set by admin ("Contract" | "Report" | "Media")
  // type: the actual MIME type of the file
  clientFiles: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    type: v.string(),       // MIME type e.g. "application/pdf"
    fileLabel: v.optional(v.string()), // "Contract" | "Report" | "Media"
    name: v.string(),
    size: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_user_and_label", ["userId", "fileLabel"]),

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

  monthlyReports: defineTable({
    clientId: v.id("users"),
    monthYear: v.string(),
    kpiCards: v.object({
      totalViews: v.number(),
      accountsReached: v.number(),
      totalInteractions: v.number(),
      profileVisits: v.number(),
      totalContentPosted: v.number(),
    }),
    contentType: v.object({
      reels: v.number(),
      stories: v.number(),
      posts: v.number(),
    }),
    engagement: v.object({
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    }),
    topReels: v.array(v.object({
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()), // legacy field
      views: v.number(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    topPosts: v.array(v.object({
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()), // legacy field
      viewsOrReach: v.number(),
      date: v.string(),
      caption: v.optional(v.string()),
    })),
    strategicInsights: v.object({
      performanceSummary: v.string(),
      bestContentType: v.string(),
      growthOpportunity: v.string(),
    }),
    previousMonth: v.optional(v.object({
      views: v.number(),
      reach: v.number(),
      interactions: v.number(),
    })),
    createdAt: v.string(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_clientId_and_monthYear", ["clientId", "monthYear"]),

  planRequests: defineTable({
    userId: v.id("users"),
    // Denormalized snapshot at creation time — avoids N+1 joins on queries
    clientName: v.optional(v.string()),
    clientEmail: v.optional(v.string()),
    type: v.string(),
    planName: v.optional(v.string()),
    previousPlan: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.string(),
  })
    .index("by_userId_and_createdAt", ["userId", "createdAt"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),
  rateLimits: defineTable({
    identifier: v.string(),
    attempts: v.number(),
    lastAttempt: v.number(),
  }).index("by_identifier", ["identifier"]),
});
