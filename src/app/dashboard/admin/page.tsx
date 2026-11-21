"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
  ServiceStatusBadge,
} from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  api,
  ApiError,
  type BookingWithDetails,
  type ServiceWithVendor,
  type TransactionWithVendor,
} from "@/lib/api";
import { formatBDT, formatDate, initials } from "@/lib/helpers";
import type { User } from "@/types";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarRange,
  CheckCircle2,
  FolderOpen,
  Hourglass,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

export default function AdminOverviewPage() {
  return (
    <DashboardPage role="admin">
      <AdminOverview />
    </DashboardPage>
  );
}

type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  totalTransactions: number;
  totalRevenue: number;
};

type AdminUser = User & {
  serviceCount: number;
  bookingCount: number;
  requestCount: number;
};

function AdminOverview() {
  const { user } = useAuth();

  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<ServiceWithVendor[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithVendor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user?.role !== "admin") return;

    let cancelled = false;

    async function loadOverview() {
      try {
        const [stats, usersRes, servicesRes, bookingsRes, transactionsRes] =
          await Promise.all([
            api.adminStats(),
            api.adminUsers(),
            api.adminServices(),
            api.adminBookings(),
            api.adminTransactions(),
          ]);

        if (cancelled) return;

        setStatsData(stats);
        setUsers(usersRes.users);
        setServices(servicesRes.services);
        setBookings(bookingsRes.bookings);
        setTransactions(transactionsRes.transactions);
      } catch {
        // Leave whatever is already on screen.
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const isLoading = Boolean(user) && !loaded;

  const stats = useMemo(
    () => ({
      totalUsers: statsData?.totalUsers ?? users.length,
      vendors:
        statsData?.totalVendors ??
        users.filter((u) => u.role === "vendor").length,
      customers:
        statsData?.totalCustomers ??
        users.filter((u) => u.role === "customer").length,
      totalServices: statsData?.totalServices ?? services.length,
      pendingServices:
        statsData?.pendingServices ??
        services.filter((s) => s.status === "pending").length,
      totalTransactions: statsData?.totalTransactions ?? transactions.length,
    }),
    [statsData, users, services, transactions],
  );

  const usersByRole = useMemo(
    () => [
      { name: "Vendors", value: stats.vendors, fill: "#683e4b" },
      { name: "Customers", value: stats.customers, fill: "#c98291" },
      {
        name: "Admins",
        value: users.filter((u) => u.role === "admin").length,
        fill: "#8e9b84",
      },
    ],
    [users, stats],
  );

  const bookingsByStatus = useMemo(
    () => [
      {
        name: "Pending",
        value: bookings.filter((b) => b.status === "pending").length,
        fill: "#f2b552",
      },
      {
        name: "Accepted",
        value: bookings.filter((b) => b.status === "accepted").length,
        fill: "#5c9d63",
      },
      {
        name: "Rejected",
        value: bookings.filter((b) => b.status === "rejected").length,
        fill: "#d66d66",
      },
      {
        name: "Cancelled",
        value: bookings.filter((b) => b.status === "cancelled").length,
        fill: "#9b96a0",
      },
    ],
    [bookings],
  );

  const servicesByStatus = useMemo(
    () => [
      {
        status: "Approved",
        count: services.filter((s) => s.status === "approved").length,
      },
      {
        status: "Pending",
        count: services.filter((s) => s.status === "pending").length,
      },
      {
        status: "Rejected",
        count: services.filter((s) => s.status === "rejected").length,
      },
    ],
    [services],
  );

  const recentUsers = [...users]
    .filter((u) => u.role !== "admin")
    .sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    )
    .slice(0, 5);

  const pendingApprovals = services
    .filter((s) => s.status === "pending")
    .slice(0, 4);

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const handleQuickApprove = async (
    serviceId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await api.adminSetServiceStatus(serviceId, status);
      toast.success(
        status === "approved"
          ? "Service approved — it is now live on the marketplace."
          : "Service rejected — it is hidden from customers.",
      );
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update the service.",
      );
    }
  };

  if (isLoading && !statsData) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-r from-[#efe9f2] via-card to-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck aria-hidden className="size-4 text-[#3d2f52]" />{" "}
            Platform administration
          </p>
          <h1 className="mt-0.5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Admin Overview
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            {stats.pendingServices > 0
              ? `${stats.pendingServices} ${stats.pendingServices === 1 ? "service needs" : "services need"} review before going live.`
              : "All services have been reviewed — the marketplace is up to date."}
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-fit gap-1.5 border-[#3d2f52]/30 text-[#3d2f52] hover:bg-[#efe9f2]"
        >
          <Link href="/dashboard/admin/services">
            Review Services <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          tone="default"
        />
        <StatCard
          title="Vendors"
          value={stats.vendors}
          icon={Store}
          tone="rose"
        />
        <StatCard
          title="Customers"
          value={stats.customers}
          icon={Users}
          tone="sage"
        />
        <StatCard
          title="Total Services"
          value={stats.totalServices}
          icon={FolderOpen}
          tone="default"
        />
        <StatCard
          title="Pending Services"
          value={stats.pendingServices}
          icon={Hourglass}
          tone="amber"
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions}
          icon={BadgeDollarSign}
          tone="sage"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usersByRole}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {usersByRole.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} ${name === "Vendors" ? "vendors" : name === "Customers" ? "customers" : "admins"}`,
                    name,
                  ]}
                />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">
              Bookings by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingsByStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {bookingsByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} ${String(name).toLowerCase()}`,
                    name,
                  ]}
                />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">
              Services by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={servicesByStatus}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#eae2dc"
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: "#79757b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#79757b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "#f9eef0" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {servicesByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={
                        entry.status === "Approved"
                          ? "#8e9b84"
                          : entry.status === "Pending"
                            ? "#f2b552"
                            : "#d66d66"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending approvals */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg">
              Pending Approvals
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/admin/services">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 aria-hidden />}
                title="Nothing to review"
                description="All submitted services have been processed."
                className="border-0 py-8"
              />
            ) : (
              pendingApprovals.map((service) => {
                const vendor = service.vendor;
                return (
                  <div
                    key={service.id}
                    className="rounded-lg border border-border p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {service.serviceName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {vendor?.businessName ?? vendor?.name} ·{" "}
                          {service.category}
                        </p>
                      </div>
                      <ServiceStatusBadge
                        status={service.status}
                        className="shrink-0"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 flex-1 gap-1 bg-emerald-700 text-white hover:bg-emerald-700/90"
                        onClick={() =>
                          void handleQuickApprove(service.id, "approved")
                        }
                      >
                        <CheckCircle2 aria-hidden className="size-3.5" />{" "}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() =>
                          void handleQuickApprove(service.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent registrations */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg">
              Recent Registrations
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/admin/users">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <Avatar className="size-9 border border-border">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-rose-tint text-xs text-burgundy">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Joined {formatDate(user.joinedAt)}
                  </p>
                </div>
                <span
                  className={
                    user.role === "vendor"
                      ? "shrink-0 rounded-full bg-rose-tint px-2.5 py-0.5 text-xs font-medium text-burgundy"
                      : "shrink-0 rounded-full bg-sage-tint px-2.5 py-0.5 text-xs font-medium text-[#4d5c44]"
                  }
                >
                  {user.role}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg">
              Recent Transactions
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/admin/transactions">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((t) => {
              const vendor = t.vendor;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {vendor?.businessName ?? vendor?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.createdAt)} · {formatBDT(t.amount)}
                    </p>
                  </div>
                  <PaymentStatusBadge
                    status={t.paymentStatus}
                    className="shrink-0"
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Booking snapshot */}
      <section className="space-y-3" aria-label="Latest booking activity">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Latest Booking Activity
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">
              Latest booking requests across the platform
            </caption>
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Service
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Event Date
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[...bookings]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .slice(0, 5)
                .map((b) => {
                  const customer = b.customer;
                  const service = b.service;
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-4 py-3">{customer?.name ?? "—"}</td>
                      <td className="max-w-52 truncate px-4 py-3">
                        {service?.serviceName ?? "—"}
                      </td>
                      <td className="px-4 py-3">{formatDate(b.eventDate)}</td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={b.status} />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarRange aria-hidden className="size-3.5" />
          Showing the 5 most recent requests — see the full picture in Manage
          Users and Transactions.
        </p>
      </section>
    </div>
  );
}
