"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Images,
  PenLine,
  Send,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServiceForm } from "@/components/forms/service-form";
import { Button } from "@/components/ui/button";
import { FREE_PLAN, PREMIUM_PLAN } from "@/lib/constants";
import type { Service } from "@/types";

export default function AddServicePage() {
  return (
    <DashboardPage>
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
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-rose-tint via-card to-card p-6 shadow-xs sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-rose-soft/50 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit gap-1.5 text-muted-foreground"
          >
            <Link href="/dashboard/vendor/services">
              <ArrowLeft aria-hidden className="size-4" /> Back to My Services
            </Link>
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy/75">
                Vendor studio
              </p>
              <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                Add a New Service
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Share your wedding service with thousands of couples. It goes
                live after a quick admin review.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-sm">
              <Sparkles aria-hidden className="size-3.5 text-[#c9a227]" />
              {stats?.currentPlan === "premium"
                ? "Premium · Unlimited listings"
                : `Free plan · ${activeCount}/${FREE_PLAN.maxActiveServices} active`}
            </span>
          </div>
        </div>
      </div>

      {limitReached ? (
        <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-200 bg-linear-to-b from-amber-50 via-amber-50/80 to-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Sparkles aria-hidden className="size-6" />
            </span>
            <h2 className="font-serif text-xl font-semibold text-amber-900">
              You&apos;ve reached the Free plan limit
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-amber-800/85">
              Your Free plan allows up to {FREE_PLAN.maxActiveServices} active
              services, and you currently have {activeCount}. To publish more,
              deactivate an existing service or upgrade to Premium for unlimited
              listings.
            </p>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Button asChild className="gap-1.5">
              <Link href="/dashboard/vendor/subscription">
                <Sparkles aria-hidden className="size-4" /> Upgrade to Premium —{" "}
                {PREMIUM_PLAN.price.toLocaleString("en-IN")} ৳ / 30 days
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-amber-300 bg-transparent text-amber-900 hover:bg-amber-100"
            >
              <Link href="/dashboard/vendor/services">
                Manage Active Services
              </Link>
            </Button>
          </div>

          <div className="mt-7 border-t border-amber-200/80 pt-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-800/70">
              What Premium includes
            </p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {PREMIUM_PLAN.features.slice(0, 3).map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-lg bg-white/70 dark:bg-card/70 px-3 py-2.5 text-xs leading-relaxed text-amber-900"
                >
                  <Check
                    aria-hidden
                    className="mt-0.5 size-3.5 shrink-0 text-amber-600"
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <>
          {/* How it works */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: PenLine,
                title: "Basic details",
                description: "Name, category, price and location",
              },
              {
                icon: Images,
                title: "Add photos",
                description: "Up to 6 images — the first is the cover",
              },
              {
                icon: Send,
                title: "Submit for review",
                description: "An admin approves before it goes live",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-tint text-burgundy">
                  <step.icon aria-hidden className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <span className="text-xs text-muted-foreground">
                      0{i + 1}
                    </span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-xs sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Service details
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Fill in the details below — you can edit them any time.
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                * Required fields
              </span>
            </div>
            <ServiceForm mode="create" />
          </section>
        </>
      )}
    </div>
  );
}
