"use client";

import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { DEMO_ACCOUNTS } from "@/data/users";
import { dashboardHomeForRole, DEMO_PASSWORD } from "@/lib/constants";
import { initials } from "@/lib/helpers";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn, googleDemoSignIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const googleParam = searchParams.get("google");
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
    router.push(redirectTo ?? dashboardHomeForRole(role));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
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

  const handleDemoSignIn = async (
    accountEmail: string,
    accountName: string,
  ) => {
    const result = await signIn(accountEmail, DEMO_PASSWORD);
    if (!result.ok || !result.user) {
      toast.error(result.error ?? "Could not sign in with this demo account.");
      return;
    }
    finishSignIn(accountName, result.user.role);
  };

  const handleGoogle = async () => {
    if (googleParam === "demo") {
      toast.info("Google OAuth is not configured in this environment.", {
        description: "Signing you in with the demo Google account instead.",
      });
    }
    setGoogleLoading(true);
    const result = await googleDemoSignIn();
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
          <div className="grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() =>
                  void handleDemoSignIn(account.email, account.name)
                }
                className="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-rose-soft hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="size-9 border border-border">
                  <AvatarImage src={account.image} alt="" />
                  <AvatarFallback className="bg-rose-tint text-xs text-burgundy">
                    {initials(account.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {account.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {account.name}
                  </span>
                </span>
                <UserRound
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-burgundy"
                />
              </button>
            ))}
          </div>
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

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.97 10.97 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
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
