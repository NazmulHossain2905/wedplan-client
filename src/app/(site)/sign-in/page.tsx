import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm, SignInSkeleton } from "@/components/forms/sign-in-form";
import { AuthRedirect } from "@/components/forms/auth-redirect";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to WedPlan to manage your bookings, services, and wedding plans.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <AuthRedirect>
        <SignInForm />
      </AuthRedirect>
    </Suspense>
  );
}
