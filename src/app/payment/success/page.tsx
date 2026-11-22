import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { PaymentSuccessView } from "@/components/payment/payment-success-view";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your WedPlan Premium subscription is active.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 aria-hidden className="size-8 animate-spin text-rose" />
        </div>
      }
    >
      <PaymentSuccessView />
    </Suspense>
  );
}
