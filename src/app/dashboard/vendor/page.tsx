"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import {
  BookingStatusBadge,
  PremiumBadge,
  ServiceStatusBadge,
} from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { api, type BookingWithDetails } from "@/lib/api";
import { FREE_PLAN } from "@/lib/constants";
import { formatBDT, formatDate } from "@/lib/helpers";
import type { Service } from "@/types";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  FolderOpen,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function VendorOverviewPage() {
  return (
    <DashboardPage>
      <VendorOverview />
    </DashboardPage>
  );
}

type VendorStats = {
  totalServices: number;
  activeServices: number;
  usedServiceSlots: number;
  pendingBookings: number;
  acceptedBookings: number;
  currentPlan: "free" | "premium";
  planExpiresAt: string | null;
};

function VendorOverview() {
  const { user } = useAuth();

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [myBookings, setMyBookings] = useState<BookingWithDetails[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "vendor") return;

    let cancelled = false;

    async function loadOverview() {
      try {
        const [statsRes, bookingsRes, servicesRes] = await Promise.all([
          api.vendorStats(),
          api.vendorBookings(),
          api.vendorServices(),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setMyBookings(bookingsRes.bookings);
        setMyServices(servicesRes.services);
      } catch {
        // Leave whatever is already on screen.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const isPremium = stats?.currentPlan === "premium";
  // Pending and approved services both consume a Free-plan slot.
  const usedCount = stats?.usedServiceSlots ?? 0;
  const limitReached = !isPremium && usedCount >= FREE_PLAN.maxActiveServices;

  const recentBookings = myBookings.slice(0, 3);
  const recentServices = myServices.slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting + plan */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-linear-to-r from-rose-tint via-card to-card p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="mt-0.5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            {user?.businessName ?? user?.name}
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            {pendingBookings.length > 0
              ? `${pendingBookings.length} booking ${pendingBookings.length === 1 ? "request" : "requests"} awaiting your response.`
              : "No pending booking requests right now — a great time to polish your listings."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2.5 lg:items-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current plan:</span>
            {isPremium ? (
              <PremiumBadge />
            ) : (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                Free
              </span>
            )}
          </div>
          {isPremium ? (
            <p className="text-xs text-muted-foreground">
              {stats?.planExpiresAt
                ? `Active — renews ${formatDate(stats.planExpiresAt)}`
                : "Active"}
            </p>
          ) : (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/dashboard/vendor/subscription">
                <Sparkles aria-hidden className="size-4" /> Upgrade to Premium
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Services"
          value={stats?.totalServices ?? 0}
          icon={FolderOpen}
          tone="default"
        />
        <StatCard
          title="Plan Services Used"
          value={usedCount}
          icon={BadgeCheck}
          tone="sage"
          hint={
            isPremium
              ? "Unlimited with Premium"
              : `${usedCount}/${FREE_PLAN.maxActiveServices} on Free plan`
          }
        />
        <StatCard
          title="Pending Booking Requests"
          value={stats?.pendingBookings ?? 0}
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          title="Accepted Bookings"
          value={stats?.acceptedBookings ?? 0}
          icon={CheckCircle2}
          tone="rose"
        />
        <StatCard
          title="Current Plan"
          value={
            <span className="capitalize">{stats?.currentPlan ?? "free"}</span>
          }
          icon={CreditCard}
          tone="default"
        />
      </div>

      {/* Free plan limit banner */}
      {limitReached ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-amber-600"
            />
            <div>
              <p className="font-medium text-amber-900">
                You&apos;ve reached the Free plan limit (
                {FREE_PLAN.maxActiveServices} pending or approved services)
              </p>
              <p className="mt-0.5 text-sm text-amber-800/80">
                Rejected services free up a slot. Upgrade to Premium for
                unlimited services and a Premium vendor badge.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/dashboard/vendor/subscription">
              Upgrade to Premium
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent booking requests */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg">
              Recent Booking Requests
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/vendor/bookings">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && myBookings.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <EmptyState
                icon={<CalendarRange aria-hidden />}
                title="No booking requests yet"
                description="Once customers discover your services, their requests will appear here."
                className="border-0 py-8"
              />
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {booking.service?.serviceName ?? "Service"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.customer?.name} · {formatDate(booking.eventDate)}
                    </p>
                  </div>
                  <BookingStatusBadge
                    status={booking.status}
                    className="shrink-0"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent services */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="font-serif text-lg">
              Your Latest Services
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-burgundy"
            >
              <Link href="/dashboard/vendor/services">
                View all <ArrowRight aria-hidden className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && myServices.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 w-full animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : recentServices.length === 0 ? (
              <EmptyState
                icon={<FolderOpen aria-hidden />}
                title="No services yet"
                description="Publish your first wedding service to start receiving bookings."
                action={{
                  label: "Add Service",
                  href: "/dashboard/vendor/services/new",
                }}
                className="border-0 py-8"
              />
            ) : (
              recentServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {service.serviceName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatBDT(service.price)} · {service.location}
                    </p>
                  </div>
                  <ServiceStatusBadge
                    status={service.status}
                    className="shrink-0"
                  />
                </div>
              ))
            )}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
            >
              <Link href="/dashboard/vendor/services/new">
                <PlusCircle aria-hidden className="size-4" /> Add New Service
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
