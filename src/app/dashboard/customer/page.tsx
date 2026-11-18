"use client";

import { CustomerBookingCard } from "@/components/bookings/customer-booking-card";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServiceCard } from "@/components/services/service-card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  useBookings,
  useCustomerStats,
  usePublicServices,
} from "@/hooks/queries";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Compass,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function CustomerOverviewPage() {
  return (
    <DashboardPage role="customer">
      <CustomerOverview />
    </DashboardPage>
  );
}

function CustomerOverview() {
  const { user } = useAuth();
  const { data: bookingsData, isLoading } = useBookings(user);
  const { data: statsData } = useCustomerStats(user);
  const { data: servicesData } = usePublicServices({ limit: 30 });

  const myBookings = useMemo(
    () =>
      [...(bookingsData?.bookings ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [bookingsData],
  );

  const counts = useMemo(
    () => ({
      total: statsData?.totalBookings ?? myBookings.length,
      pending:
        statsData?.pending ??
        myBookings.filter((b) => b.status === "pending").length,
      accepted:
        statsData?.accepted ??
        myBookings.filter((b) => b.status === "accepted").length,
      rejected:
        statsData?.rejected ??
        myBookings.filter((b) => b.status === "rejected").length,
      cancelled: myBookings.filter((b) => b.status === "cancelled").length,
    }),
    [statsData, myBookings],
  );

  const recommended = useMemo(() => {
    const bookedVendorIds = new Set(myBookings.map((b) => b.vendorId));
    const bookedServiceIds = new Set(myBookings.map((b) => b.serviceId));
    const pool = (servicesData?.services ?? []).filter(
      (s) =>
        s.vendorId !== user?.id &&
        !bookedServiceIds.has(s.id) &&
        !bookedVendorIds.has(s.vendorId),
    );
    const featured = pool.filter((s) => s.featured);
    return [...featured, ...pool.filter((s) => !s.featured)].slice(0, 3);
  }, [servicesData, myBookings, user]);

  const recent = myBookings.slice(0, 3);
  const maxCount = Math.max(counts.total, 1);

  const breakdown = [
    { label: "Pending", value: counts.pending, className: "bg-amber-400" },
    { label: "Accepted", value: counts.accepted, className: "bg-emerald-500" },
    { label: "Rejected", value: counts.rejected, className: "bg-red-400" },
    { label: "Cancelled", value: counts.cancelled, className: "bg-gray-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-gradient-to-r from-rose-tint via-card to-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="mt-0.5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            {user?.name}
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            {counts.pending > 0
              ? `You have ${counts.pending} booking ${counts.pending === 1 ? "request" : "requests"} awaiting a vendor response.`
              : "Everything is up to date — time to discover your next vendor."}
          </p>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link href="/services">
            <Compass aria-hidden className="size-4" /> Explore Services
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Booking Requests"
          value={counts.total}
          icon={CalendarCheck2}
          tone="default"
        />
        <StatCard
          title="Pending Bookings"
          value={counts.pending}
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          title="Accepted Bookings"
          value={counts.accepted}
          icon={CheckCircle2}
          tone="sage"
        />
        <StatCard
          title="Rejected Bookings"
          value={counts.rejected}
          icon={CalendarX2}
          tone="red"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent bookings */}
        <section
          className="space-y-4 lg:col-span-2"
          aria-label="Recent bookings"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Recent Bookings
            </h2>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/customer/bookings">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={<Heart aria-hidden />}
              title="No booking requests yet"
              description="Browse the marketplace and send your first booking request to a vendor you love."
              action={{ label: "Explore Services", href: "/services" }}
            />
          ) : (
            <div className="space-y-4">
              {recent.map((booking) => (
                <CustomerBookingCard
                  key={booking.id}
                  booking={booking}
                  service={booking.service}
                  vendor={booking.vendor}
                />
              ))}
            </div>
          )}
        </section>

        {/* Status breakdown */}
        <section className="space-y-4" aria-label="Booking status breakdown">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Status Breakdown
          </h2>
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            {counts.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                Your booking summary will appear here once you send your first
                request.
              </p>
            ) : (
              <>
                <div
                  className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label="Booking status distribution"
                >
                  {breakdown.map((b) =>
                    b.value > 0 ? (
                      <div
                        key={b.label}
                        className={b.className}
                        style={{ width: `${(b.value / maxCount) * 100}%` }}
                        title={`${b.label}: ${b.value}`}
                      />
                    ) : null,
                  )}
                </div>
                <ul className="space-y-2.5">
                  {breakdown.map((b) => (
                    <li
                      key={b.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden
                          className={`size-2.5 rounded-full ${b.className}`}
                        />
                        {b.label}
                      </span>
                      <span className="font-semibold text-foreground">
                        {b.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Recommended */}
      {recommended.length > 0 ? (
        <section aria-label="Recommended services" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Recommended for You
            </h2>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/services">
                See more <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                vendor={service.vendor}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
