"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServiceForm } from "@/components/forms/service-form";
import { Button } from "@/components/ui/button";
import { FREE_PLAN, PREMIUM_PLAN } from "@/lib/constants";
import type { Service } from "@/types";

export default function AddServicePage() {
  return (
    <DashboardPage role="vendor">
      <AddService />
    </DashboardPage>
  );
}

type VendorStats = {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  currentPlan: "free" | "premium";
  planExpiresAt: string | null;
};

function AddService() {
  const { user } = useAuth();

  const [stats, setStats] = React.useState<VendorStats | null>(null);
  const [myServices, setMyServices] = React.useState<Service[]>([]);

  React.useEffect(() => {
    if (user?.role !== "vendor") return;

    let cancelled = false;

    async function loadOverview() {
      try {
        const [statsRes, servicesRes] = await Promise.all([
          api.vendorStats(),
          api.vendorServices(),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setMyServices(servicesRes.services);
      } catch {
        // Leave the page usable even if the summary fails to load.
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const activeCount =
    stats?.activeServices ??
    myServices.filter((s) => s.status === "approved" && s.isAvailable).length;
  const limitReached =
    (stats?.currentPlan ?? user?.subscriptionPlan) === "free" &&
    activeCount >= FREE_PLAN.maxActiveServices;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
          <Link href="/dashboard/vendor/services">
            <ArrowLeft aria-hidden className="size-4" /> Back to My Services
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Add a New Service
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your wedding service with thousands of couples. It goes live after a quick admin
            review.
          </p>
        </div>
      </div>

      {limitReached ? (
        <div className="mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-xs">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Sparkles aria-hidden className="size-6" />
          </span>
          <h2 className="font-serif text-xl font-semibold text-amber-900">
            You&apos;ve reached the Free plan limit
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-800/85">
            Your Free plan allows up to {FREE_PLAN.maxActiveServices} active services, and you
            currently have {activeCount}. To publish more, deactivate an existing service or
            upgrade to Premium for unlimited listings.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button asChild className="gap-1.5">
              <Link href="/dashboard/vendor/subscription">
                <Sparkles aria-hidden className="size-4" /> Upgrade to Premium —{" "}
                {PREMIUM_PLAN.price.toLocaleString("en-IN")} ৳/month
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100">
              <Link href="/dashboard/vendor/services">Manage Active Services</Link>
            </Button>
          </div>
          <ul className="mx-auto mt-6 grid max-w-sm gap-1.5 text-left text-xs text-amber-800/80">
            {PREMIUM_PLAN.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden className="size-1.5 rounded-full bg-amber-500" /> {f}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ServiceForm mode="create" />
      )}
    </div>
  );
}
