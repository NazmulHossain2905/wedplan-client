"use client";

import { DashboardLoading } from "@/components/dashboard/dashboard-shell";
import { useAuth } from "@/contexts/auth-context";

/**
 * Keeps dashboard content from flashing before the client session hydrates.
 * Access control (authentication, blocked accounts and roles) is handled by
 * the proxy before the page renders, so this is only a loading boundary.
 */
export function DashboardPage({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  if (!hydrated || !user) return <DashboardLoading />;
  return <>{children}</>;
}
