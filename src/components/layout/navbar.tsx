"use client";

import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { dashboardHomeForRole } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Explore Services" },
];

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-card pl-5 text-burgundy shadow-sm ring-1 ring-burgundy/10 before:absolute before:left-2.5 before:size-1.5 before:rounded-full before:bg-rose"
          : "text-foreground/70 hover:bg-card/70 hover:text-burgundy",
      )}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-all duration-200",
        active
          ? "bg-burgundy/10 text-burgundy shadow-xs"
          : "text-foreground/80 hover:bg-rose-tint hover:text-burgundy",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          active ? "bg-rose" : "bg-border",
        )}
      />
      {label}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated, hydrated, user, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 shadow-xs backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        <nav
          className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/50 p-1 shadow-xs backdrop-blur-sm md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!hydrated ? (
            <Skeleton className="size-9 rounded-full" />
          ) : isAuthenticated && user ? (
            <UserMenu />
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full px-4 text-foreground/80 hover:bg-rose-tint hover:text-burgundy"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="gap-1.5 rounded-full bg-linear-to-r from-burgundy to-burgundy-deep px-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href="/sign-up">
                  <UserPlus aria-hidden className="size-4" /> Get Started
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        <div className="flex items-center gap-2 md:hidden">
          {!hydrated ? (
            <Skeleton className="size-9 rounded-full" />
          ) : isAuthenticated && user ? (
            <UserMenu onNavigate={() => setMobileOpen(false)} />
          ) : null}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 rounded-full border-border/70 bg-card/80 shadow-xs transition-colors hover:bg-rose-tint hover:text-burgundy"
                aria-label="Open navigation menu"
              >
                {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[300px] max-w-[88vw] flex-col gap-0 p-0"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex items-center justify-between border-b border-border/70 bg-linear-to-r from-rose-tint/70 to-card px-5 py-4">
                <Logo size="sm" linked={false} />
              </div>
              <nav
                className="flex flex-col gap-1 px-4 py-4"
                aria-label="Mobile navigation"
              >
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Menu
                </p>
                {NAV_LINKS.map((link) => (
                  <MobileNavLink
                    key={link.href}
                    {...link}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
                {hydrated && isAuthenticated && user ? (
                  <MobileNavLink
                    href={dashboardHomeForRole(user.role)}
                    label="Dashboard"
                    onClick={() => setMobileOpen(false)}
                  />
                ) : null}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border px-5 py-4">
                {!hydrated ? null : isAuthenticated && user ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setMobileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full rounded-full"
                      onClick={() => {
                        void signOut();
                        setMobileOpen(false);
                        toast.success("You have been signed out.");
                        router.push("/");
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full gap-1.5 rounded-full bg-linear-to-r from-burgundy to-burgundy-deep shadow-sm"
                    >
                      <Link
                        href="/sign-up"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserPlus aria-hidden className="size-4" /> Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
