"use client";

import { PremiumBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { dashboardHomeForRole } from "@/lib/constants";
import { formatBDT } from "@/lib/helpers";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  Receipt,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Payment success page. The status shown here is read from the server's
 * /api/subscription/status endpoint, which is read-only. The webhook has
 * already done the activation; this redirect never grants Premium itself.
 */
interface PaymentResult {
  status: string;
  amount: number;
  currency: string;
  plan: string;
  activated: boolean;
}

type VerificationState = "verifying" | "succeeded" | "failed" | "no-session";

export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();

  const [data, setData] = useState<PaymentResult | null>(null);
  const [state, setState] = useState<VerificationState>(
    sessionId && user ? "verifying" : "no-session",
  );

  const shouldVerify = Boolean(user) && Boolean(sessionId);
  const isVerifying = state === "verifying";
  const succeeded = state === "succeeded";

  // Keep asking the server until the webhook has finished processing. A 404
  // (webhook not recorded yet) or a network/5xx error is still "verifying" —
  // only a definitive rejection or exhausted retries count as a failure.
  useEffect(() => {
    if (!sessionId) {
      setState("no-session");
      return;
    }
    // The session may still be hydrating — stay in "verifying" until it is.
    if (!shouldVerify) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    async function verify() {
      try {
        const result = await api.subscriptionStatus(sessionId!);
        if (cancelled) return;

        const transaction = result.transaction;
        if (!transaction) {
          setState("failed");
          return;
        }

        const mapped: PaymentResult = {
          status: transaction.paymentStatus,
          amount: transaction.amount,
          currency: transaction.currency ?? "BDT",
          plan: result.plan,
          activated: result.activated,
        };

        setData(mapped);

        if (mapped.activated || mapped.status === "succeeded") {
          setState("succeeded");
          return;
        }
        if (
          mapped.status === "failed" ||
          mapped.status === "canceled" ||
          mapped.status === "rejected"
        ) {
          setState("failed");
          return;
        }
      } catch (error) {
        if (cancelled) return;
        // A bad session or forbidden user is a real failure; everything else
        // (transaction not written yet, 5xx, offline) is still in progress.
        if (
          error instanceof ApiError &&
          (error.status === 400 || error.status === 403)
        ) {
          setState("failed");
          return;
        }
      }

      if (cancelled) return;
      if (attempts >= MAX_ATTEMPTS) {
        setState("failed");
        return;
      }
      attempts += 1;
      timer = setTimeout(() => void verify(), 1500);
    }

    void verify();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [shouldVerify, sessionId]);

  const notifiedRef = React.useRef(false);

  React.useEffect(() => {
    if (succeeded && !notifiedRef.current) {
      notifiedRef.current = true;
      toast.success("Premium plan activated!", {
        description: "Your vendor account now has unlimited active services.",
      });
    }
  }, [succeeded]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-tint/60 via-background to-background px-4 py-16">
      <div className="w-full max-w-lg space-y-8 text-center">
        {isVerifying ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 aria-hidden className="size-10 animate-spin text-rose" />
            <p className="text-sm text-muted-foreground">
              Verifying your payment…
            </p>
          </div>
        ) : (
          <div
            className={`mx-auto flex size-20 items-center justify-center rounded-full shadow-sm ${
              succeeded
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {succeeded ? (
              <CheckCircle2 aria-hidden className="size-10" />
            ) : (
              <XCircle aria-hidden className="size-10" />
            )}
          </div>
        )}

        {isVerifying ? null : (
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              {succeeded
                ? "Payment Successful"
                : state === "failed"
                  ? "Payment Not Completed"
                  : "No Checkout Session"}
            </h1>
            <p className="leading-relaxed text-muted-foreground">
              {succeeded
                ? `Thank you${user ? `, ${user.name}` : ""}! Your Premium subscription is now active — it was unlocked by the verified payment event from the webhook, not by this page.`
                : state === "failed"
                  ? "We couldn't verify this payment. If you were charged, check your billing history before trying again — Premium is activated only by a verified payment event."
                  : "No checkout session was found for this visit."}
            </p>
            {succeeded ? (
              <div className="flex items-center justify-center gap-2 pt-1">
                <Crown aria-hidden className="size-4 text-[#c9a227]" />
                <span className="text-sm font-medium text-foreground">
                  Premium Vendor
                </span>
                <PremiumBadge compact />
              </div>
            ) : null}
          </div>
        )}

        {data && !isVerifying ? (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="space-y-4 p-6 text-left">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Receipt aria-hidden className="size-4 text-rose" /> Transaction
                Details
              </p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium capitalize">
                    {data.plan} · 1 month
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Amount</dt>
                  <dd className="font-semibold text-burgundy">
                    {formatBDT(data.amount)} {data.currency}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Payment status</dt>
                  <dd>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        data.status === "succeeded"
                          ? "bg-emerald-100 text-emerald-800"
                          : data.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {data.status}
                    </span>
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">
                    Checkout session
                  </dt>
                  <dd className="flex min-w-0 items-center gap-1.5">
                    <span className="break-all text-right font-mono text-xs">
                      {sessionId}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(sessionId ?? "")
                          .then(() =>
                            toast.success("Session ID copied to clipboard."),
                          )
                          .catch(() =>
                            toast.error("Could not copy the session ID."),
                          );
                      }}
                      aria-label="Copy checkout session ID"
                      className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Copy aria-hidden className="size-3.5" />
                    </button>
                  </dd>
                </div>
              </dl>
              <p className="rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                A receipt was recorded in your billing history and the platform
                transactions log when the webhook verified the payment.
              </p>
            </CardContent>
          </Card>
        ) : isVerifying ? null : (
          <p className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
            No checkout session was found for this visit. Open your subscription
            page to see the current plan status and billing history.
          </p>
        )}

        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button asChild size="lg" className="gap-2 shadow-sm">
            <Link
              href={
                user ? dashboardHomeForRole(user.role) : "/dashboard/vendor"
              }
            >
              Return to Dashboard <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard/vendor/subscription">View Subscription</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
