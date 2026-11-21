"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
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
  const { user, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRole !== "any" && user && user.role !== allowedRole) {
      const home =
        user.role === "admin"
          ? "/dashboard/admin"
          : user.role === "vendor"
            ? "/dashboard/vendor"
            : "/dashboard/customer";
      toast.error("You are not allowed to access that dashboard.");
      router.replace(home);
      return;
    }
    setChecked(true);
  }, [hydrated, isAuthenticated, user, allowedRole, router, pathname]);

  return {
    user,
    ready:
      hydrated &&
      checked &&
      !!user &&
      (allowedRole === "any" || user.role === allowedRole),
  };
}
