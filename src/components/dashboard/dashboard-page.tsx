"use client";

import { DashboardLoading } from "@/components/dashboard/dashboard-shell";
import { useRoleGuard } from "@/components/providers";

/**
 * Wraps a dashboard page: shows the loading skeleton while hydrating,
 * redirects unauthenticated users to sign-in, and sends users to their
 * own dashboard when they try to open another role's area by URL.
 */
export function DashboardPage({
  role,
  children,
}: {
  role: "customer" | "vendor" | "admin" | "any";
  children: React.ReactNode;
}) {
  const { ready } = useRoleGuard(role);
  if (!ready) return <DashboardLoading />;
  return <>{children}</>;
}
