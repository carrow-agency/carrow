import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import bcrypt from "bcryptjs";
import { captureError } from "./sentry";

const ADMIN_EMAIL = "admin@carrow.com";
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function logError(ctx: any, message: string, stack: string, source: string, url?: string) {
  try {
    await ctx.db.insert("errorLogs", {
      message,
      stack,
      source,
      url,
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  } catch (e) {
    console.error("Failed to log error:", e);
  }
}

export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.email || !args.email.includes("@")) {
        throw new Error("Invalid email address");
      }
      if (!args.password || args.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      
      const existing = await ctx.db.query("users")
        .filter(q => q.eq(q.field("email"), args.email))
        .first();
      
      if (existing) {
        throw new Error("Email already registered");
      }
      
      const passwordHash = await hashPassword(args.password);
      
      const userId = await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        passwordHash,
        role: args.email === ADMIN_EMAIL ? "admin" : "user",
        planStatus: "none",
      });
      
      return { success: true, userId };
    } catch (error) {
      await logError(ctx, (error as Error).message, (error as Error).stack || "", "backend", "auth.signUp");
      captureError(error as Error, { email: args.email, action: "signUp" });
      throw error;
    }
  },
});

export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.email || !args.password) {
        throw new Error("Email and password are required");
      }
      
      const user = await ctx.db.query("users")
        .filter(q => q.eq(q.field("email"), args.email))
        .first();
      
      if (!user) {
        throw new Error("No account found with this email");
      }
      
      if (!user.passwordHash) {
        throw new Error("Account password not set. Please use password reset.");
      }
      
      const isValid = await verifyPassword(args.password, user.passwordHash);
      if (!isValid) {
        throw new Error("Incorrect password. Please try again.");
      }
      
      return { success: true, userId: user._id };
    } catch (error) {
      await logError(ctx, (error as Error).message, (error as Error).stack || "", "backend", "auth.signIn");
      captureError(error as Error, { email: args.email, action: "signIn" });
      throw error;
    }
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
});