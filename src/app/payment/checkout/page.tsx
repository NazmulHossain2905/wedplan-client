import { CheckoutView } from "@/components/payment/checkout-view";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Checkout",
  description: "Complete your WedPlan Premium upgrade.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 aria-hidden className="size-8 animate-spin text-rose" />
        </div>
      }
    >
      <CheckoutView />
    </Suspense>
  );
}
