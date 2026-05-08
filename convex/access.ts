import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  
  const user = await ctx.db.get(userId);
  if (!user) return false;
  
  return user.role === "admin";
}

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  return getAuthUserId(ctx);
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}