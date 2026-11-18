"use client";

import { HeartCrack, RotateCcw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

/**
 * Global client error boundary — friendly recovery UI for unexpected runtime
 * errors (instead of a white screen). Users can retry or return home safely.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[WedPlan] Unhandled client error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-rose-tint/50 via-background to-background px-4 py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-tint text-burgundy shadow-sm">
          <HeartCrack aria-hidden className="size-9" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            An unexpected error interrupted the page. Your data is safe — try
            again, or return to the homepage and continue planning your perfect
            day.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-burgundy px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-burgundy/90"
          >
            <RotateCcw aria-hidden className="size-4" /> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
