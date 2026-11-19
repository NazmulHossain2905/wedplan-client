"use client";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { dashboardHomeForRole, DEMO_PASSWORD } from "@/lib/constants";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GoogleIcon } from "../shared/social-icons";

export function SignInForm() {
  const { signIn, googleSignIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const googleError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (googleError === "blocked") {
      toast.error("This account has been blocked by an administrator.");
    } else if (googleError) {
      toast.error("Google sign-in failed. Please try again.");
    }
  }, [googleError]);

  const finishSignIn = (name: string, role: string) => {
    toast.success(`Welcome back, ${name.split(" ")[0]}!`, {
      description: "You are now signed in to WedPlan.",
    });
    // Only allow same-app paths from ?redirect to avoid an open redirect.
    const target =
      redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : dashboardHomeForRole(role);
    router.replace(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    const result = await signIn(email, password, remember);
    setSubmitting(false);
    if (!result.ok || !result.user) {
      toast.error(result.error ?? "Sign in failed.");
      return;
    }
    finishSignIn(result.user.name, result.user.role);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await googleSignIn();
    setGoogleLoading(false);
    if (!result.ok || !result.user) {
      toast.error(result.error ?? "Google sign-in failed.");
      return;
    }
    finishSignIn(result.user.name, result.user.role);
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
      {/* Form panel */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Logo size="lg" />
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            Welcome back to WedPlan
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your bookings, services, and wedding plans.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs font-medium text-rose hover:underline"
                onClick={() =>
                  toast.info("Password reset is not available in this demo.", {
                    description:
                      "Demo accounts all use the password shown below.",
                  })
                }
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff aria-hidden className="size-4" />
                ) : (
                  <Eye aria-hidden className="size-4" />
                )}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            Remember me
          </label>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Signing
                in…
              </>
            ) : (
              <>
                <LogIn aria-hidden className="size-4" /> Sign In
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={googleLoading}
          onClick={() => void handleGoogle()}
        >
          {googleLoading ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}{" "}
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to WedPlan?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-burgundy hover:underline"
          >
            Create an account
          </Link>
        </p>

        {/* Quick demo access */}
        <div className="mt-8 rounded-xl border border-dashed border-rose-soft bg-rose-tint/60 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles aria-hidden className="size-4 text-rose" />
            <h2 className="font-serif text-base font-semibold text-foreground">
              Quick Demo Access
            </h2>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            One click signs you in as a seeded demo account. Password for all
            demo accounts:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-burgundy">
              {DEMO_PASSWORD}
            </code>
          </p>
          <div className="grid gap-2 sm:grid-cols-2"></div>
        </div>
      </div>

      {/* Image panel */}
      <div className="relative hidden h-[560px] overflow-hidden rounded-2xl shadow-lg lg:block">
        <img
          src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80"
          alt="A romantic bridal bouquet held during a wedding ceremony"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a2129]/85 via-[#3a2129]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <ShieldCheck aria-hidden className="mb-3 size-8 text-rose-soft" />
          <p className="font-serif text-2xl font-medium leading-snug text-white">
            &ldquo;Every love story deserves a beautiful beginning.&rdquo;
          </p>
          <p className="mt-2 text-sm text-white/75">
            Trusted by 2,000+ couples across Bangladesh and beyond.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignInSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <Skeleton className="mb-8 h-11 w-44" />
      <Skeleton className="mb-2 h-9 w-64" />
      <Skeleton className="mb-8 h-5 w-72" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
