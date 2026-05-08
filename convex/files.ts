import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, getCurrentUser } from "./access";
import { captureError } from "./sentry";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveClientFile = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.optional(v.id("users")),
    type: v.string(),
    name: v.string(),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser) {
        throw new Error("Authentication required");
      }
      
      const targetUserId = args.userId || currentUser._id;
      
      if (targetUserId !== currentUser._id && currentUser.role !== "admin") {
        throw new Error("Unauthorized to save files for this user");
      }
      
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(args.type)) {
        throw new Error("File type not allowed. Use JPEG, PNG, WebP, or PDF.");
      }
      
      const maxSize = 10 * 1024 * 1024;
      if (args.size && args.size > maxSize) {
        throw new Error("File too large. Maximum 10MB allowed.");
      }
      
      await ctx.db.insert("clientFiles", {
        storageId: args.storageId,
        userId: targetUserId,
        type: args.type,
        name: args.name,
        size: args.size,
      });
    } catch (error) {
      captureError(error as Error, { fileName: args.name, action: "saveClientFile" });
      throw error;
    }
  },
});

export const getAllFiles = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }
    
    const files = await ctx.db.query("clientFiles").collect();
    
    const filesWithUrls = await Promise.all(
      files.map(async (f) => {
        const url = await ctx.storage.getUrl(f.storageId);
        return { ...f, url };
      })
    );
    
    return filesWithUrls;
  },
});

export const getClientFiles = query({
  args: { userId: v.optional(v.id("users")), type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error("Authentication required");
    }
    
    let targetUserId = args.userId;
    if (!targetUserId) {
      targetUserId = currentUser._id;
    }
    
    if (targetUserId !== currentUser._id && currentUser.role !== "admin") {
      throw new Error("Unauthorized to view this user's files");
    }
    
    let files = await ctx.db
      .query("clientFiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId!))
      .collect();
      
    if (args.type) {
      files = files.filter(f => f.type === args.type);
    }
    
    const filesWithUrls = await Promise.all(
      files.map(async (f) => {
        const url = await ctx.storage.getUrl(f.storageId);
        return { ...f, url };
      })
    );
    
    return filesWithUrls;
  },
});

export const deleteClientFile = mutation({
  args: { id: v.id("clientFiles"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    try {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser) {
        throw new Error("Authentication required");
      }
      
      const file = await ctx.db.get(args.id);
      if (!file) {
        throw new Error("File not found");
      }
      
      if (file.userId !== currentUser._id && currentUser.role !== "admin") {
        throw new Error("Unauthorized to delete this file");
      }
      
      await ctx.storage.delete(args.storageId);
      await ctx.db.delete(args.id);
    } catch (error) {
      captureError(error as Error, { fileId: args.id, action: "deleteClientFile" });
      throw error;
    }
  },
});