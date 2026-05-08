import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  return true;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  try {
    return await getAuthUserId(ctx);
  } catch {
    return null;
  }
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  try {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  } catch {
    return null;
  }
}