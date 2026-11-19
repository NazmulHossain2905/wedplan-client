"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { dashboardHomeForRole } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wraps the sign-in / sign-up forms: authenticated users are bounced to their
 * dashboard instead of seeing the auth forms again.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const role = user?.role as string | undefined;
  const isAuthenticated = Boolean(user) && !user?.isBlocked;

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(dashboardHomeForRole(role ?? "customer"));
  }, [isAuthenticated, role, router]);

  // Wait for the session before deciding: rendering the form while the
  // session is still loading either flashes it for signed-in users or starts
  // a redundant redirect.
  if (isPending) {
    return <AuthRedirectSkeleton message="Checking your session…" />;
  }

  if (isAuthenticated) {
    return <AuthRedirectSkeleton message="Taking you to your dashboard…" />;
  }

  return <>{children}</>;
}

function AuthRedirectSkeleton({ message }: { message: string }) {
  return (
    <div
      className="mx-auto w-full max-w-md space-y-4 px-4 py-16"
      aria-busy="true"
    >
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-5 w-72" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
