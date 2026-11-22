import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your WedPlan dashboard.",
};

/**
 * Dashboard shell. Authentication, blocked accounts and role access are all
 * decided by the proxy before this layout renders.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
