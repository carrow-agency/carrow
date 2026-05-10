import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc, Id } from "./_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

async function getUserFromCtx(ctx: Ctx): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId as Id<"users">);
  if (!user) {
    // If the user document was deleted but the auth account still exists,
    // we should return null, but also maybe the client should handle it.
    // For now, let's return null.
    return null;
  }
  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<boolean> {
  const user = await getUserFromCtx(ctx);
  if (!user) return false;
  return user.role === "admin";
}

export async function requireAuth(ctx: Ctx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId as Id<"users">;
}

export async function getCurrentUserId(ctx: Ctx): Promise<Id<"users"> | null> {
  try {
    const userId = await getAuthUserId(ctx);
    return userId as Id<"users"> | null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(ctx: Ctx): Promise<Doc<"users"> | null> {
  try {
    return await getUserFromCtx(ctx);
  } catch {
    return null;
  }
}

export async function requireAdminUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getUserFromCtx(ctx);
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
  return user;
}

/**
 * Requires that the caller is either an admin OR the target user themselves.
 * Eliminates repeated inline `isAdmin || isSelf` patterns.
 */
export async function requireAdminOrSelf(ctx: Ctx, targetUserId: Id<"users">): Promise<void> {
  const user = await getUserFromCtx(ctx);
  if (!user) throw new Error("Authentication required");
  if (user.role === "admin") return;
  if (user._id === targetUserId) return;
  throw new Error("Access denied: must be admin or the target user");
}
