"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { dashboardHomeForRole } from "@/lib/constants";
import { CircleX, CreditCard, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { user } = useAuth();

  // Mark the open checkout session as failed so it cannot be completed later.
  useEffect(() => {
    if (sessionId) {
      void api.cancelPayment(sessionId).catch(() => {
        // Already processed or expired — nothing to do.
      });
    }
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-amber-50 via-background to-background px-4 py-16">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-sm">
          <CircleX aria-hidden className="size-10" />
        </div>

        <div className="space-y-3">
          <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
            Payment Cancelled
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            Your Premium upgrade was cancelled before the payment was completed.
            No charge was made, and your current plan remains unchanged.
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 text-left">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CreditCard aria-hidden className="size-4" /> What happens now?
          </p>
          <ul className="mt-2.5 space-y-1.5 text-sm leading-relaxed text-amber-800/85">
            <li>• Your Free plan benefits stay exactly as they were.</li>
            <li>
              • The abandoned checkout session has been closed and recorded as
              failed.
            </li>
            <li>• You can restart the upgrade whenever you&apos;re ready.</li>
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/dashboard/vendor/subscription">
              <RotateCcw aria-hidden className="size-4" /> Try Again
            </Link>
          </Button>
          <Button asChild size="lg" className="gap-2 shadow-sm">
            <Link
              href={
                user ? dashboardHomeForRole(user.role) : "/dashboard/vendor"
              }
            >
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
