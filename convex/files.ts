import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, getCurrentUser } from "./access";
import { captureError } from "./sentry";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveClientFile = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.optional(v.id("users")),
    fileLabel: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    name: v.string(),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser) throw new Error("Authentication required");

      const targetUserId = args.userId ?? currentUser._id;
      if (targetUserId !== currentUser._id && currentUser.role !== "admin") {
        throw new Error("Unauthorized to save files for this user");
      }

      const maxSize = 20 * 1024 * 1024; // 20MB
      if (args.size && args.size > maxSize) {
        throw new Error("File too large. Maximum 20 MB allowed.");
      }

      const mimeType = args.mimeType ?? "application/octet-stream";
      const label = args.fileLabel ?? "Media";

      await ctx.db.insert("clientFiles", {
        storageId: args.storageId,
        userId: targetUserId,
        type: mimeType,
        fileLabel: label,
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

    const files = await ctx.db.query("clientFiles").order("desc").take(1000);

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
  args: {
    userId: v.optional(v.id("users")),
    fileLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Authentication required");

    const targetUserId = args.userId ?? currentUser._id;
    if (targetUserId !== currentUser._id && currentUser.role !== "admin") {
      throw new Error("Unauthorized to view this user's files");
    }

    let files = await ctx.db
      .query("clientFiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .order("desc")
      .take(500);

    if (args.fileLabel) {
      files = files.filter((f) => f.fileLabel === args.fileLabel);
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
  args: { id: v.id("clientFiles") },
  handler: async (ctx, args) => {
    try {
      const currentUser = await getCurrentUser(ctx);
      if (!currentUser) throw new Error("Authentication required");

      const file = await ctx.db.get(args.id);
      if (!file) throw new Error("File not found");

      if (file.userId !== currentUser._id && currentUser.role !== "admin") {
        throw new Error("Unauthorized to delete this file");
      }

      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(args.id);
    } catch (error) {
      captureError(error as Error, { fileId: args.id, action: "deleteClientFile" });
      throw error;
    }
  },
});
