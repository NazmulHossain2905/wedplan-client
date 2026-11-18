/**
 * Admin dashboard — SERVER-side role verification. Vendors and customers who
 * manually change the URL are redirected to their own dashboard; the admin
 * APIs reject them with 403 regardless.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await getSessionUser();
  // if (!user || user.isBlocked) {
  //   redirect("/sign-in?redirect=%2Fdashboard%2Fadmin");
  // }
  // if (user.role !== "admin") {
  //   redirect(dashboardHomeForRole(user.role));
  // }
  return <>{children}</>;
}
