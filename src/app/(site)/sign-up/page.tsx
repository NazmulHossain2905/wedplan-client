import { AuthRedirect } from "@/components/forms/auth-redirect";
import { SignUpForm, SignUpSkeleton } from "@/components/forms/sign-up-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your WedPlan account as a couple planning a wedding or a vendor growing your business.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <AuthRedirect>
        <SignUpForm />
      </AuthRedirect>
    </Suspense>
  );
}
