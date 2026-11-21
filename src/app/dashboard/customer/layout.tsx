import { dashboardHomeForRole } from "@/lib/constants";
import { getActiveUser } from "@/server/guards";
import { redirect } from "next/navigation";

/** Customer dashboard — verified on the server before anything renders. */
export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getActiveUser();

  if (!user) {
    redirect("/sign-in?redirect=%2Fdashboard%2Fcustomer");
  }

  if (user.role !== "customer") {
    redirect(dashboardHomeForRole(user.role));
  }

  return <>{children}</>;
}
