"use client";

import { authClient } from "@/lib/auth-client";
import type { User } from "@/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

/**
 * Authentication context backed by Better Auth.
 *
 * Better Auth is the single source of truth for the session: this provider,
 * `<AuthRedirect>` and the dashboard guards all read the same `useSession`
 * state. Previously this provider used the demo API client's
 * `/api/auth/session` endpoint, which does not exist in this app (Better Auth
 * serves `/api/auth/get-session`). The guards therefore always saw a signed-out
 * user while Better Auth saw a signed-in one, producing an endless
 * sign-in ↔ dashboard redirect loop.
 */

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "vendor" | "admin";
  businessName?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  googleSignIn: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const { data: session, isPending, refetch } = authClient.useSession();

  // Better Auth's session user carries the additional fields defined in
  // `lib/auth.ts` (role, businessName, isBlocked, subscriptionPlan, …), so it
  // already matches the app's `User` shape.
  const user = useMemo(
    () => (session?.user as unknown as User | undefined) ?? initialUser,
    [session?.user, initialUser],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password, remember = true) => {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe: remember,
      });
      if (error) {
        return { ok: false, error: error.message ?? "Sign in failed." };
      }
      const nextUser = (data?.user as unknown as User) ?? null;
      return { ok: true, user: nextUser ?? undefined };
    },
    [],
  );

  const signUp = useCallback<AuthContextValue["signUp"]>(async (input) => {
    const { data, error } = await authClient.signUp.email(input);
    if (error) {
      return { ok: false, error: error.message ?? "Registration failed." };
    }
    const nextUser = (data?.user as unknown as User) ?? null;
    return { ok: true, user: nextUser ?? undefined };
  }, []);

  const googleSignIn = useCallback(async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      return { ok: false, error: error.message ?? "Google sign-in failed." };
    }
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await authClient.signOut();
  }, []);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user) && !user?.isBlocked,
      // `isPending` can briefly be false while `session` is still undefined
      // right after sign-in/navigation. Acting on that state bounces the user
      // between Sign In and the dashboard (visible as continuous shaking).
      hydrated: !isPending && session !== undefined,
      signIn,
      signUp,
      googleSignIn,
      signOut,
      refresh,
    }),
    [user, isPending, signIn, signUp, googleSignIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
