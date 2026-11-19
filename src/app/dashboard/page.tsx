import { dashboardHomeForRole } from "@/lib/constants";
import { getSessionUser } from "@/server/guards";
import { redirect } from "next/navigation";

/** /dashboard — server-side redirect to the role-appropriate dashboard. */
export default async function DashboardIndexPage() {
  const user = await getSessionUser();
  if (!user || user.isBlocked) {
    redirect("/sign-in?redirect=%2Fdashboard");
  }
  redirect(dashboardHomeForRole(user.role));
}
