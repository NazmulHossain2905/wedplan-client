import { auth } from "@/lib/auth";
import type { User } from "@/types";
import { headers } from "next/headers";

/**
 * Reads the Better Auth session for the current request and returns the user.
 *
 * `auth.api.getSession()` resolves to `{ session, user }` — not the user
 * itself — and returns `null` when the request has no valid session. The
 * returned user includes the additional fields declared in `lib/auth.ts`
 * (role, isBlocked, businessName, subscriptionPlan, …), so it matches the
 * app's `User` shape at runtime.
 */
export async function getSessionUser(): Promise<User | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) return null;
  return result.user as unknown as User;
}

/**
 * Session user that is allowed to use the app: signed in and not blocked.
 * Returns `null` for guests and suspended accounts.
 */
export async function getActiveUser(): Promise<User | null> {
  const user = await getSessionUser();
  if (!user || user.isBlocked) return null;
  return user;
}
