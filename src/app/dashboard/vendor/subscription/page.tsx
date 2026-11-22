"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { FREE_PLAN, PREMIUM_PLAN, PREMIUM_PRICE_BDT } from "@/lib/constants";
import { formatBDT, formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";
import {
  Check,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VendorSubscriptionPage() {
  return (
    <DashboardPage>
      <VendorSubscription />
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

function VendorSubscription() {
  const { user } = useAuth();

  const [stats, setStats] = useState<VendorStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (user?.role !== "vendor") return;

    let cancelled = false;

    async function loadSubscription() {
      try {
        const [statsRes, transactionsRes] = await Promise.all([
          api.vendorStats(),
          api.vendorTransactions(),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setTransactions(transactionsRes.transactions);
      } catch {
        // Leave whatever is already on screen.
      } finally {
        // A failed request still finishes loading — never leave the skeleton up.
        if (!cancelled) setLoading(false);
      }
    }

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isPremium = stats?.currentPlan === "premium";
  const myTransactions = transactions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  /** Creates a server-side Checkout Session and redirects to it. */
  const startCheckout = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const session = await api.createCheckout();
      // Stripe Checkout is hosted by Stripe; Premium is activated by the
      // verified webhook, not by arriving back at /payment/success.
      window.location.href = session.url;
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not start the checkout. Please try again.",
      );
      setStarting(false);
    }
  };

  const header = (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
        Subscription
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your WedPlan vendor plan. Upgrade anytime to unlock unlimited
        services and a Premium badge.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-8">
        {header}
        <SubscriptionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}

      {/* Current plan status */}
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between",
          isPremium
            ? "border-[#c9a227]/40 bg-gradient-to-r from-[#faf3dc] to-card dark:from-[#342b1d]"
            : "border-border bg-card",
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-lg",
              isPremium
                ? "bg-[#c9a227]/15 text-[#8a6d2f]"
                : "bg-rose-tint text-burgundy",
            )}
          >
            {isPremium ? (
              <Crown aria-hidden className="size-6" />
            ) : (
              <CreditCard aria-hidden className="size-6" />
            )}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {isPremium ? "Premium Plan" : "Free Plan"}
              </h2>
              <Badge
                className={cn(
                  "border-0",
                  isPremium
                    ? "bg-gradient-to-r from-[#8a6d2f] to-[#c9a227] text-white"
                    : "bg-muted text-foreground",
                )}
              >
                {isPremium ? "Active" : "Current plan"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPremium
                ? stats?.planExpiresAt
                  ? `Unlimited active services · Active until ${formatDate(stats.planExpiresAt)}`
                  : "Unlimited active services"
                : `Up to ${FREE_PLAN.maxActiveServices} active services · ৳${PREMIUM_PLAN.price.toLocaleString("en-IN")} per 30 days to upgrade`}
            </p>
          </div>
        </div>
        {isPremium ? (
          <div className="flex items-center gap-2 text-sm text-[#8a6d2f]">
            <ShieldCheck aria-hidden className="size-4" />
            Premium benefits active
          </div>
        ) : (
          <Button
            size="lg"
            className="gap-2 shadow-sm"
            onClick={() => void startCheckout()}
            disabled={starting}
          >
            {starting ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Sparkles aria-hidden className="size-4" />
            )}{" "}
            {starting ? "Opening checkout…" : "Upgrade to Premium"}
          </Button>
        )}
      </div>

      {/* Pricing cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free */}
        <div
          className={cn(
            "relative rounded-xl border bg-card p-7 shadow-xs",
            !isPremium ? "border-burgundy/50 shadow-sm" : "border-border",
          )}
        >
          {!isPremium ? (
            <span className="absolute -top-3 left-6 rounded-full bg-burgundy px-3 py-1 text-xs font-semibold text-white">
              Current Plan
            </span>
          ) : null}
          <h3 className="font-serif text-xl font-semibold text-foreground">
            Free
          </h3>
          <p className="mt-2">
            <span className="font-serif text-4xl font-semibold text-foreground">
              ৳0
            </span>
            <span className="text-sm text-muted-foreground"> /month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {FREE_PLAN.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2.5 text-sm text-muted-foreground"
              >
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-sage"
                />
                {f}
              </li>
            ))}
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground/60">
              <X aria-hidden className="mt-0.5 size-4 shrink-0" />
              Premium vendor badge
              <span className="sr-only">not included</span>
            </li>
            <li className="flex items-start gap-2.5 text-sm text-muted-foreground/60">
              <X aria-hidden className="mt-0.5 size-4 shrink-0" />
              Homepage featuring
              <span className="sr-only">not included</span>
            </li>
          </ul>
        </div>

        {/* Premium */}
        <div
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card p-7 shadow-sm transition-shadow sm:p-8",
            isPremium
              ? "border-[#c9a227]/60 shadow-md"
              : "border-[#c9a227]/50 shadow-md ring-1 ring-[#c9a227]/20 hover:shadow-lg",
          )}
        >
          {/* Soft gold glow — clipped on its own so the badge is never cut off */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            aria-hidden
          >
            <div className="absolute -right-14 -top-14 size-44 rounded-full bg-[#c9a227]/15 blur-2xl" />
            <div className="absolute -bottom-16 -left-12 size-44 rounded-full bg-rose-tint/80 blur-2xl" />
          </div>

          <span
            className={cn(
              "absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm",
              isPremium
                ? "bg-gradient-to-r from-[#8a6d2f] to-[#c9a227]"
                : "bg-burgundy",
            )}
          >
            {isPremium ? (
              <Crown aria-hidden className="size-3.5" />
            ) : (
              <Sparkles aria-hidden className="size-3.5" />
            )}
            {isPremium ? "Your Plan" : "Most Popular"}
          </span>

          <div className="relative flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Premium
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#c9a227]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a6d2f]">
                Best value
              </span>
            </div>

            <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-serif text-4xl font-semibold text-foreground">
                {formatBDT(PREMIUM_PRICE_BDT)}
              </span>
              <span className="text-sm text-muted-foreground">/ 30 days</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              One-time payment · no auto-renewal
            </p>

            <ul className="mt-6 space-y-3">
              {PREMIUM_PLAN.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm text-foreground/85"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#c9a227]/15">
                    <Check aria-hidden className="size-3 text-[#8a6d2f]" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="mt-7 w-full gap-2 shadow-sm"
              size="lg"
              variant={isPremium ? "outline" : "default"}
              disabled={isPremium || starting}
              onClick={() => void startCheckout()}
            >
              {isPremium ? (
                <>
                  <Crown aria-hidden className="size-4" /> Premium is Active
                </>
              ) : starting ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />{" "}
                  Opening checkout…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden className="size-4" /> Upgrade to Premium
                </>
              )}
            </Button>
            {!isPremium ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck aria-hidden className="size-3.5 text-sage" />
                Secure checkout powered by Stripe
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Billing history */}
      <section className="space-y-3" aria-label="Billing history">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Billing History
        </h2>
        {myTransactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/60 px-5 py-8 text-center text-sm text-muted-foreground">
            No payments yet — your Premium invoices will appear here after
            upgrading.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-sm">
              <caption className="sr-only">Your subscription payments</caption>
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Plan
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Amount
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {myTransactions.slice(0, 5).map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3 capitalize">{t.plan}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatBDT(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          t.paymentStatus === "succeeded"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.paymentStatus === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-sky-100 text-sky-800",
                        )}
                      >
                        {t.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/** Mirrors the subscription layout so the page does not flash plan/billing data. */
function SubscriptionSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading subscription">
      {/* Current plan status */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-44 shrink-0 rounded-md" />
      </div>

      {/* Pricing cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-7 shadow-xs">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-28" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-3/4" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-32" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-2/3" />
            ))}
          </div>
          <Skeleton className="mt-7 h-11 w-full rounded-md" />
        </div>
      </div>

      {/* Billing history */}
      <section className="space-y-3" aria-label="Loading billing history">
        <Skeleton className="h-6 w-44" />
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="h-10 w-full rounded-none bg-muted/50" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-t border-border/60 px-4 py-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
