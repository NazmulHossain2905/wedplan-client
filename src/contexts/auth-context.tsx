"use client";

import { authClient } from "@/lib/auth-client";
import type { User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";

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
  googleDemoSignIn: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const { data: session, isPending, refetch } = authClient.useSession();
  const queryClient = useQueryClient();

  // Better Auth's session user carries the additional fields defined in
  // `lib/auth.ts` (role, businessName, isBlocked, subscriptionPlan, …), so it
  // already matches the app's `User` shape.
  const user = React.useMemo(
    () => (session?.user as unknown as User | undefined) ?? initialUser,
    [session?.user, initialUser],
  );

  const applyUser = React.useCallback(
    (nextUser: User | null) => {
      queryClient.setQueryData(["session"], nextUser);
      // Role/data caches belong to the previous identity.
      queryClient.removeQueries({
        predicate: (q) => q.queryKey[0] !== "session",
      });
    },
    [queryClient],
  );

  const signIn = React.useCallback<AuthContextValue["signIn"]>(
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
      if (nextUser) applyUser(nextUser);
      return { ok: true, user: nextUser ?? undefined };
    },
    [applyUser],
  );

  const signUp = React.useCallback<AuthContextValue["signUp"]>(
    async (input) => {
      const { data, error } = await authClient.signUp.email(input);
      if (error) {
        return { ok: false, error: error.message ?? "Registration failed." };
      }
      const nextUser = (data?.user as unknown as User) ?? null;
      if (nextUser) applyUser(nextUser);
      return { ok: true, user: nextUser ?? undefined };
    },
    [applyUser],
  );

  const googleDemoSignIn = React.useCallback(async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      return { ok: false, error: error.message ?? "Google sign-in failed." };
    }
    return { ok: true };
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await authClient.signOut();
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  const refresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user) && !user?.isBlocked,
      hydrated: !isPending,
      signIn,
      signUp,
      googleDemoSignIn,
      signOut,
      refresh,
    }),
    [user, isPending, signIn, signUp, googleDemoSignIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
