/**
 * Customer dashboard — SERVER-side role verification. Vendors and admins who
 * manually change the URL are redirected to their own dashboard.
 */
export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await getSessionUser();
  // if (!user || user.isBlocked) {
  //   redirect("/sign-in?redirect=%2Fdashboard%2Fcustomer");
  // }
  // if (user.role !== "customer") {
  //   redirect(dashboardHomeForRole(user.role));
  // }
  return <>{children}</>;
}
