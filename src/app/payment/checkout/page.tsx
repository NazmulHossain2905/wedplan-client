"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatBDT } from "@/lib/helpers";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CheckoutInfo {
  sessionId: string;
  plan: string;
  amount: number;
  currency: string;
  vendorName: string;
  status: string;
}

/**
 * Sandbox payment provider checkout page (used when real Stripe keys are not
 * configured). Mirrors the Stripe Checkout flow: the vendor confirms here,
 * the provider emits a signed webhook, and ONLY the verified webhook
 * activates Premium. This page never activates anything itself.
 */
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? "";
  const router = useRouter();
  const { user } = useAuth();
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [data, setData] = useState<CheckoutInfo | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function loadCheckout() {
      try {
        const info = await api.checkoutInfo(sessionId);
        if (!cancelled) setData(info);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    try {
      await api.simulatePayment(sessionId);
      router.push(
        `/payment/success?session_id=${encodeURIComponent(sessionId)}`,
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "The payment could not be processed.",
      );
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await api.cancelPayment(sessionId);
    } catch {
      // A failed cancel (e.g. already paid) still routes to the cancel page.
    }
    router.push(`/payment/cancel?session_id=${encodeURIComponent(sessionId)}`);
  };

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-2xl font-semibold">
            Checkout session not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This checkout link is invalid or has expired.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/dashboard/vendor/subscription">
              Back to Subscription
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f9fc] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Provider chrome */}
        <div className="mb-5 flex items-center justify-center gap-2 text-[#425466]">
          <Lock aria-hidden className="size-4 text-[#8792a2]" />
          <span className="text-sm font-medium">WedPlan Test Checkout</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Sandbox
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e3e8ee] bg-white shadow-sm">
          <div className="border-b border-[#e3e8ee] px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8792a2]">
              Pay WedPlan
            </p>
            {isLoading ? (
              <div className="mt-3 space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ) : error || !data ? (
              <div className="mt-2">
                <p className="text-sm text-red-600">
                  {error instanceof ApiError
                    ? error.message
                    : "This checkout session could not be found."}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/dashboard/vendor/subscription">
                    Back to Subscription
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm font-medium text-[#1a1f36]">
                  Premium Vendor Subscription
                </p>
                <p className="text-xs text-[#8792a2]">
                  For {data.vendorName} · 1 month · Unlimited active services,
                  premium badge
                </p>
              </>
            )}
          </div>

          {data ? (
            <div className="space-y-5 px-6 py-6">
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-[#425466]">Subtotal</dt>
                  <dd className="font-medium text-[#1a1f36]">
                    {formatBDT(data.amount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-[#e3e8ee] pt-2">
                  <dt className="font-semibold text-[#1a1f36]">
                    Total due today
                  </dt>
                  <dd className="font-serif text-2xl font-semibold text-burgundy">
                    {formatBDT(data.amount)} {data.currency}
                  </dd>
                </div>
              </dl>

              <div className="space-y-2 rounded-lg border border-[#e3e8ee] bg-[#f6f9fc] p-3.5">
                <p className="flex items-center gap-2 text-xs font-semibold text-[#425466]">
                  <CreditCard aria-hidden className="size-3.5" /> Test payment
                  method
                </p>
                <div className="rounded-md border border-[#e3e8ee] bg-white px-3 py-2.5 font-mono text-xs text-[#425466]">
                  4242 4242 4242 4242 · 12 / 34 · CVC 123
                </div>
                <p className="text-[11px] leading-relaxed text-[#8792a2]">
                  This sandbox provider stands in for Stripe Checkout in test
                  mode. Paying emits a signed{" "}
                  <code>checkout.session.completed</code> event to the webhook,
                  which is the only code path that activates Premium.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 bg-[#5b31d6] hover:bg-[#4c28b3]"
                onClick={() => void handlePay()}
                disabled={paying || cancelling}
              >
                {paying ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />{" "}
                    Processing payment…
                  </>
                ) : (
                  <>Pay {formatBDT(data.amount)}</>
                )}
              </Button>
              <button
                type="button"
                onClick={() => void handleCancel()}
                disabled={paying || cancelling}
                className="w-full text-center text-sm font-medium text-[#5b31d6] transition-colors hover:text-[#4c28b3] disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Cancel payment"}
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[#8792a2]">
          <ShieldCheck aria-hidden className="size-3.5" />
          Premium activates only after the payment event is verified by the
          webhook.
        </p>
        <p className="mt-2 text-center text-xs text-[#8792a2]">
          Signed in as {user?.name ?? "vendor"}
        </p>
      </div>
    </div>
  );
}
