import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getActiveUser } from "@/server/guards";
import { redirect } from "next/navigation";
import { PaymentSuccessView } from "@/components/payment/payment-success-view";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Your WedPlan Premium subscription is active.",
};

export default async function PaymentSuccessPage() {
  const user = await getActiveUser();
  if (!user) redirect("/sign-in?redirect=%2Fpayment%2Fsuccess");

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
