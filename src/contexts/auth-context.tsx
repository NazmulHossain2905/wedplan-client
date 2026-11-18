"use client";

import { api, ApiError } from "@/lib/api";
import type { User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";

/**
 * Authentication context backed by the server session (httpOnly JWT cookie).
 * The navbar updates immediately after sign-in / sign-out because the
 * session cache is updated synchronously.
 */

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signUp: (
    input: Record<string, unknown>,
  ) => Promise<{ ok: boolean; error?: string; user?: User }>;
  googleDemoSignIn: () => Promise<{ ok: boolean; error?: string; user?: User }>;
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
  const [user, setUser] = React.useState<User | null>(initialUser);
  const [hydrated, setHydrated] = React.useState(Boolean(initialUser));
  const queryClient = useQueryClient();

  // Restore the session from the server cookie on first mount (keeps users
  // authenticated across page refreshes).
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: sessionUser } = await api.session();
        if (!cancelled) setUser(sessionUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyUser = React.useCallback(
    (nextUser: User | null) => {
      setUser(nextUser);
      queryClient.setQueryData(["session"], nextUser);
      if (!nextUser) queryClient.removeQueries({ queryKey: ["session"] });
      // Role/data caches belong to the previous identity.
      queryClient.removeQueries({
        predicate: (q) => q.queryKey[0] !== "session",
      });
    },
    [queryClient],
  );

  const signIn = React.useCallback<AuthContextValue["signIn"]>(
    async (email, password, remember = true) => {
      try {
        const { user: signedIn } = await api.signIn(email, password, remember);
        applyUser(signedIn);
        return { ok: true, user: signedIn };
      } catch (error) {
        return { ok: false, error: toMessage(error) };
      }
    },
    [applyUser],
  );

  const signUp = React.useCallback<AuthContextValue["signUp"]>(
    async (input) => {
      try {
        const { user: created } = await api.signUp(input);
        applyUser(created);
        return { ok: true, user: created };
      } catch (error) {
        return { ok: false, error: toMessage(error) };
      }
    },
    [applyUser],
  );

  const googleDemoSignIn = React.useCallback<
    AuthContextValue["googleDemoSignIn"]
  >(async () => {
    try {
      const { user: created } = await api.googleDemo();
      applyUser(created);
      return { ok: true, user: created };
    } catch (error) {
      return { ok: false, error: toMessage(error) };
    }
  }, [applyUser]);

  const signOut = React.useCallback(async () => {
    try {
      await api.signOut();
    } finally {
      applyUser(null);
    }
  }, [applyUser]);

  const refresh = React.useCallback(async () => {
    try {
      const { user: sessionUser } = await api.session();
      setUser(sessionUser);
      queryClient.setQueryData(["session"], sessionUser);
    } catch {
      setUser(null);
    }
  }, [queryClient]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user) && !user?.isBlocked,
      hydrated,
      signIn,
      signUp,
      googleDemoSignIn,
      signOut,
      refresh,
    }),
    [user, hydrated, signIn, signUp, googleDemoSignIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}
