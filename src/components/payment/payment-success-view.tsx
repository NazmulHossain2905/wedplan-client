"use client";

import { PremiumBadge } from "@/components/shared/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { usePaymentVerify } from "@/hooks/queries";
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
import { toast } from "sonner";

/**
 * Payment success page. The status shown here is SERVER-VERIFIED via
 * /api/payment/verify (and the webhook has already done the activation);
 * the success redirect itself is never trusted to grant Premium.
 */
export function PaymentSuccessView() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();
  const { data, isLoading } = usePaymentVerify(user, sessionId ?? "");

  const activated = data?.activated ?? false;
  const notifiedRef = React.useRef(false);

  React.useEffect(() => {
    if (activated && !notifiedRef.current) {
      notifiedRef.current = true;
      toast.success("Premium plan activated!", {
        description: "Your vendor account now has unlimited active services.",
      });
    }
  }, [activated]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-tint/60 via-background to-background px-4 py-16">
      <div className="w-full max-w-lg space-y-8 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 aria-hidden className="size-10 animate-spin text-rose" />
            <p className="text-sm text-muted-foreground">
              Verifying your payment…
            </p>
          </div>
        ) : (
          <div
            className={`mx-auto flex size-20 items-center justify-center rounded-full shadow-sm ${
              activated
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {activated ? (
              <CheckCircle2 aria-hidden className="size-10" />
            ) : (
              <XCircle aria-hidden className="size-10" />
            )}
          </div>
        )}

        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            {activated ? "Payment Successful" : "Payment Not Completed"}
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            {activated
              ? `Thank you${user ? `, ${user.name}` : ""}! Your Premium subscription is now active — it was unlocked by the verified payment event from the webhook, not by this page.`
              : "We could not confirm this payment. If you completed it recently, refresh in a moment; otherwise the checkout may have been cancelled."}
          </p>
          {activated ? (
            <div className="flex items-center justify-center gap-2 pt-1">
              <Crown aria-hidden className="size-4 text-[#c9a227]" />
              <span className="text-sm font-medium text-foreground">
                Premium Vendor
              </span>
              <PremiumBadge compact />
            </div>
          ) : null}
        </div>

        {data ? (
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
        ) : isLoading ? null : (
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
