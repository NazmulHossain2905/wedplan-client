"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";

/**
 * Waits for the session before rendering the sign-in / sign-up form so it does
 * not flash for a moment for signed-in visitors.
 *
 * It intentionally does NOT redirect logged-in users away from the form — the
 * proxy does that. A client redirect here caused a loop with the old dashboard
 * guards after sign-in.
 */
export function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isPending } = useSession();

  if (isPending) {
    return <AuthRedirectSkeleton message="Checking your session…" />;
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
