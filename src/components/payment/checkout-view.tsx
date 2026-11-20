"use client";

import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";

/**
 * Checkout is hosted by Stripe: POST /api/subscription/checkout returns a
 * Checkout Session URL and the vendor is redirected straight there. This page
 * only exists so an old bookmark does not land on a broken sandbox screen.
 */
export function CheckoutView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f9fc] px-4">
      <div className="max-w-md rounded-xl border border-[#e3e8ee] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f6f9fc] text-[#425466]">
          <Lock aria-hidden className="size-5" />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold">
          Checkout is handled by Stripe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start the upgrade from your subscription page. You will be sent to a
          secure Stripe Checkout page, and Premium is activated only after
          Stripe verifies the payment.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard/vendor/subscription">Back to Subscription</Link>
        </Button>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#8792a2]">
          <ShieldCheck aria-hidden className="size-3.5" />
          No card details are collected on this site.
        </p>
      </div>
    </div>
  );
}
