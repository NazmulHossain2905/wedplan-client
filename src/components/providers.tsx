"use client";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

/** Watches for the current user becoming blocked and signs them out. */
function BlockedUserWatcher() {
  const { user, signOut } = useAuth();
  const wasBlockedRef = React.useRef(false);

  React.useEffect(() => {
    if (user?.isBlocked && !wasBlockedRef.current) {
      wasBlockedRef.current = true;
      void signOut();
      toast.error("Your account has been blocked by an administrator.");
    }
    if (!user?.isBlocked) wasBlockedRef.current = false;
  }, [user, signOut]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: true,
            staleTime: 10 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BlockedUserWatcher />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
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
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
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
