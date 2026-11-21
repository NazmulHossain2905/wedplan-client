import { dashboardHomeForRole } from "@/lib/constants";
import { getActiveUser } from "@/server/guards";
import { redirect } from "next/navigation";

/** Vendor dashboard — verified on the server before anything renders. */
export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getActiveUser();

  if (!user) {
    redirect("/sign-in?redirect=%2Fdashboard%2Fvendor");
  }

  if (user.role !== "vendor") {
    redirect(dashboardHomeForRole(user.role));
  }

  return <>{children}</>;
}
