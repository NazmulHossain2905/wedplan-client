"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Watches for the current user becoming blocked and signs them out. */
function BlockedUserWatcher() {
  const { user, signOut } = useAuth();
  const wasBlockedRef = useRef(false);

  useEffect(() => {
    if (user?.isBlocked && !wasBlockedRef.current) {
      wasBlockedRef.current = true;
      void signOut();
      toast.error("Your account has been blocked by an administrator.");
    }
    if (!user?.isBlocked) wasBlockedRef.current = false;
  }, [user, signOut]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <BlockedUserWatcher />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * Convenience hook: client-side route guards used across dashboard pages.
 * Server-side verification also runs in the dashboard layouts and on every
 * API call — hiding links is never the only line of defense.
 * Pass "any" for pages shared by all roles (e.g. profile settings) —
 * only authentication is checked, not the specific role.
 */
export function useRoleGuard(
  allowedRole: "customer" | "vendor" | "admin" | "any",
) {
  const { user, hydrated } = useAuth();
  const [checked, setChecked] = useState(false);

  // The server layouts are the real guard. Client-side redirects here raced
  // with session hydration and caused a Sign In <-> dashboard loop, so this
  // effect only decides when the page is ready to render.
  useEffect(() => {
    if (hydrated) setChecked(true);
  }, [hydrated]);

  return {
    user,
    ready:
      hydrated &&
      checked &&
      !!user &&
      (allowedRole === "any" || user.role === allowedRole),
  };
}
