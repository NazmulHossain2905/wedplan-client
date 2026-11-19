import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionUser } from "@/server/guards";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your WedPlan dashboard.",
};

/**
 * Dashboard layout — SERVER-side authentication gate. Unauthenticated users
 * are redirected to Sign In before any dashboard content renders, and the
 * session survives page refreshes via the httpOnly JWT cookie.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.isBlocked) {
    redirect("/sign-in?redirect=%2Fdashboard");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
