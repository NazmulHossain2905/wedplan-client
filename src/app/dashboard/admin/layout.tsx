import { dashboardHomeForRole } from "@/lib/constants";
import { getActiveUser } from "@/server/guards";
import { redirect } from "next/navigation";

/**
 * Admin dashboard — verified on the server. The admin APIs reject wrong roles
 * with 403 too; this check just avoids rendering a page that cannot load data.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getActiveUser();

  if (!user) {
    redirect("/sign-in?redirect=%2Fdashboard%2Fadmin");
  }

  if (user.role !== "admin") {
    redirect(dashboardHomeForRole(user.role));
  }

  return <>{children}</>;
}
