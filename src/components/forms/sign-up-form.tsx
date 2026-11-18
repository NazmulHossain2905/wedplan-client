"use client";

import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { dashboardHomeForRole } from "@/lib/constants";
import { fileToDataUrl, initials } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validations";
import {
  Briefcase,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  {
    value: "customer" as const,
    title: "Customer",
    description: "I'm planning a wedding and looking for services.",
    icon: UserRound,
  },
  {
    value: "vendor" as const,
    title: "Vendor",
    description: "I offer wedding services and want to grow my business.",
    icon: Briefcase,
  },
];

export function SignUpForm() {
  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetRole =
    searchParams.get("role") === "vendor" ? "vendor" : "customer";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "vendor">(presetRole);
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pwChecks = validatePassword(password);

  useEffect(() => {
    setRole(presetRole);
  }, [presetRole]);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large (max 5 MB).");
      return;
    }
    try {
      // Local preview — the file itself is uploaded to image hosting after
      // the account is created (uploads require an authenticated session).
      const dataUrl = await fileToDataUrl(file);
      setAvatar(dataUrl);
      setAvatarFile(file);
      toast.success("Profile image ready.");
    } catch {
      toast.error("Could not read the image file.");
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!pwChecks.valid) {
      toast.error(
        "Password must be at least 6 characters with one uppercase and one lowercase letter.",
      );
      return;
    }
    setSubmitting(true);
    const result = await signUp({
      name,
      email,
      password,
      role,
      businessName: role === "vendor" ? businessName : undefined,
      location,
    });
    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error ?? "Registration failed.");
      return;
    }
    // Optional profile image: upload now that the session exists.
    if (avatarFile) {
      try {
        const { url } = await api.uploadImage(avatarFile);
        await api.updateProfile({ name: name.trim(), image: url });
      } catch {
        toast.warning(
          "Account created, but the profile image could not be uploaded.",
        );
      }
    }
    setSubmitting(false);
    toast.success(`Welcome to WedPlan, ${name.trim().split(" ")[0]}!`, {
      description:
        role === "vendor"
          ? "Your vendor account is ready — add your first service to get started."
          : "Start exploring wedding services for your big day.",
    });
    router.push(dashboardHomeForRole(role));
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-start gap-3">
          <Logo size="lg" />
          <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Join WedPlan as a couple planning your wedding or a vendor growing
            your business.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4"
          noValidate
        >
          {/* Profile image */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-rose-soft/60">
              {avatar ? (
                <AvatarImage src={avatar} alt="Profile preview" />
              ) : null}
              <AvatarFallback className="bg-rose-tint text-burgundy">
                {name ? (
                  initials(name)
                ) : (
                  <ImagePlus aria-hidden className="size-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-wrap gap-2">
              <Label
                htmlFor="avatar-upload"
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
              >
                <ImagePlus aria-hidden className="size-4" />
                {avatar ? "Change image" : "Upload image"}
              </Label>
              {avatar ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-red-50"
                  onClick={() => {
                    setAvatar("");
                    setAvatarFile(null);
                  }}
                >
                  <Trash2 aria-hidden className="size-4" /> Remove
                </Button>
              ) : (
                <span className="self-center text-xs text-muted-foreground">
                  Optional
                </span>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleImageUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Sarah Mitchell"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
                aria-describedby="password-rules"
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
            <ul
              id="password-rules"
              className="mt-1.5 grid gap-1 text-xs"
              aria-label="Password requirements"
            >
              {[
                { ok: pwChecks.minLength, label: "At least 6 characters" },
                { ok: pwChecks.hasUpper, label: "One uppercase letter" },
                { ok: pwChecks.hasLower, label: "One lowercase letter" },
              ].map((rule) => (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    rule.ok
                      ? "text-emerald-600"
                      : password
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {rule.ok ? (
                    <Check aria-hidden className="size-3.5" />
                  ) : (
                    <X aria-hidden className="size-3.5" />
                  )}
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Role selection */}
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">Account Role</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  aria-pressed={role === option.value}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-lg border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    role === option.value
                      ? "border-burgundy bg-rose-tint/70 shadow-sm"
                      : "border-border bg-card hover:border-rose-soft",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <option.icon
                      aria-hidden
                      className={cn(
                        "size-4",
                        role === option.value
                          ? "text-burgundy"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    {role === option.value ? (
                      <Check
                        aria-hidden
                        className="ml-auto size-4 text-burgundy"
                      />
                    ) : null}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Admin accounts are assigned securely by the platform — not through
              registration.
            </p>
          </fieldset>

          {role === "vendor" ? (
            <div className="space-y-2">
              <Label htmlFor="business-name">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business-name"
                placeholder="e.g. Ever After Events"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="signup-location">Location</Label>
            <Input
              id="signup-location"
              placeholder="e.g. Gulshan, Dhaka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoComplete="address-level2"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" /> Creating
                account…
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-burgundy hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          By creating an account you agree to our fair-use policy for couples
          and vendors.
        </p>
      </div>

      {/* Image panel */}
      <div className="relative hidden h-[620px] overflow-hidden rounded-2xl shadow-lg lg:block">
        <img
          src="https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=900&q=80"
          alt="A wedding photographer capturing a couple's special moment"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a2129]/88 via-[#3a2129]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-10">
          <p className="font-serif text-2xl font-medium leading-snug text-white">
            &ldquo;The best way to find vendors who feel like family.&rdquo;
          </p>
          <p className="text-sm text-white/75">
            Free for couples · Free plan for vendors · Premium when you&apos;re
            ready to grow.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SignUpSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <Skeleton className="mb-8 h-11 w-44" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
