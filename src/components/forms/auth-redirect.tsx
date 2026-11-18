"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { dashboardHomeForRole } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps the sign-in / sign-up forms: authenticated users are bounced to their
 * dashboard instead of seeing the auth forms again.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && isAuthenticated && user) {
      router.replace(dashboardHomeForRole(user.role));
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (hydrated && isAuthenticated && user) {
    return (
      <div
        className="mx-auto w-full max-w-md space-y-4 px-4 py-16"
        aria-busy="true"
      >
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72" />
        <p className="text-sm text-muted-foreground">
          Taking you to your dashboard…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
