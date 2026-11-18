import Link from "next/link";
import { Heart, Home, LayoutGrid } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory px-4 py-16 text-center">
      <div className="wed-texture pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative space-y-8">
        <Logo size="lg" />
        <div className="space-y-4">
          <p className="flex items-center justify-center gap-3">
            <Heart aria-hidden className="size-5 fill-rose-soft text-rose-soft" />
            <span className="font-serif text-7xl font-semibold text-burgundy sm:text-8xl">404</span>
            <Heart aria-hidden className="size-5 fill-rose-soft text-rose-soft" />
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            This page went on honeymoon
          </h1>
          <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get
            you back to planning your perfect day.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <Button asChild size="lg" className="gap-2 shadow-sm">
            <Link href="/">
              <Home aria-hidden className="size-4" /> Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2 border-burgundy/30 text-burgundy hover:bg-rose-tint hover:text-burgundy">
            <Link href="/services">
              <LayoutGrid aria-hidden className="size-4" /> Browse Services
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
