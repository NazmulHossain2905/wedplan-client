import { PaymentCancelView } from "@/components/payment/payment-cancel-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Payment Cancelled",
  description: "Your WedPlan Premium upgrade was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 aria-hidden className="size-8 animate-spin text-rose" />
        </div>
      }
    >
      <PaymentCancelView />
    </Suspense>
  );
}
