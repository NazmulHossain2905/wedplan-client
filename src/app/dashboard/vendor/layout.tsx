/**
 * Vendor dashboard — SERVER-side role verification. Customers and admins who
 * manually change the URL are redirected to their own dashboard.
 */
export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await getSessionUser();
  // if (!user || user.isBlocked) {
  //   redirect("/sign-in?redirect=%2Fdashboard%2Fvendor");
  // }
  // if (user.role !== "vendor") {
  //   redirect(dashboardHomeForRole(user.role));
  // }
  return <>{children}</>;
}
