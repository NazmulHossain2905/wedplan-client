"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
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
import {
  type LucideIcon,
  Loader2,
  LayoutDashboard,
  Menu,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Explore Services" },
];

const DASHBOARD_LABELS: Record<string, string> = {
  vendor: "Vendor Hub",
  customer: "My Dashboard",
  admin: "Admin Dashboard",
};

function isNavActive(pathname: string, href: string) {
  // Any page inside the dashboard keeps the dashboard link highlighted.
  if (href.startsWith("/dashboard")) return pathname.startsWith("/dashboard");
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  onClick,
  icon: Icon,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-card text-burgundy shadow-sm ring-1 ring-burgundy/10"
          : "text-foreground/70 hover:bg-card/70 hover:text-burgundy",
      )}
    >
      {Icon ? (
        <Icon aria-hidden className="size-3.5 shrink-0" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            active ? "bg-rose" : "bg-border/80",
          )}
        />
      )}
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
  icon: Icon,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);
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
      {Icon ? (
        <Icon aria-hidden className="size-4 shrink-0" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            active ? "bg-rose" : "bg-border",
          )}
        />
      )}
      {label}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated, hydrated, user, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const signedIn = hydrated && isAuthenticated && Boolean(user);
  const dashboardHref = user ? dashboardHomeForRole(user.role) : "";
  const dashboardLabel = user
    ? (DASHBOARD_LABELS[user.role] ?? "Dashboard")
    : "Dashboard";

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
          {signedIn ? (
            <>
              <span
                aria-hidden
                className="mx-1 h-5 w-px shrink-0 bg-border/80"
              />
              <NavLink
                href={dashboardHref}
                label={dashboardLabel}
                icon={LayoutDashboard}
              />
            </>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
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
                className="gap-1.5 rounded-full bg-linear-to-r from-burgundy to-burgundy-deep px-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
          <ThemeToggle />
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
                {signedIn ? (
                  <MobileNavLink
                    href={dashboardHref}
                    label={dashboardLabel}
                    icon={LayoutDashboard}
                    onClick={() => setMobileOpen(false)}
                  />
                ) : null}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border px-5 py-4">
                <ThemeToggle withLabel />
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
                      disabled={loggingOut}
                      onClick={() => {
                        if (loggingOut) return;
                        setLoggingOut(true);
                        void (async () => {
                          await signOut();
                          setMobileOpen(false);
                          toast.success("You have been signed out.");
                          router.push("/");
                        })();
                      }}
                    >
                      {loggingOut ? (
                        <>
                          <Loader2
                            aria-hidden
                            className="size-4 animate-spin"
                          />
                          Signing out…
                        </>
                      ) : (
                        "Logout"
                      )}
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
                      className="w-full gap-1.5 rounded-full bg-linear-to-r from-burgundy to-burgundy-deep text-white shadow-sm"
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
