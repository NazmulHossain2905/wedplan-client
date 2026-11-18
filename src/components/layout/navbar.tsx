"use client";

import { Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
// import { useAuth } from "@/contexts/auth-context";
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
      className={cn(
        "relative rounded-md px-1 py-2 text-sm font-medium transition-colors hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "text-burgundy after:absolute after:inset-x-1 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-rose"
          : "text-foreground/80",
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated, hydrated, user, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo size="md" />

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {!hydrated ? (
            <Skeleton className="size-9 rounded-full" />
          ) : isAuthenticated && user ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
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
                className="border-border"
                aria-label="Open navigation menu"
              >
                {mobileOpen ? <X aria-hidden /> : <Menu aria-hidden />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[300px] flex-col gap-0 p-0"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo size="sm" linked={false} />
              </div>
              <nav
                className="flex flex-col gap-1 px-5 py-4"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-rose-tint hover:text-burgundy"
                  >
                    {link.label}
                  </Link>
                ))}
                {hydrated && isAuthenticated && user ? (
                  <Link
                    href={dashboardHomeForRole(user.role)}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-rose-tint hover:text-burgundy"
                  >
                    Dashboard
                  </Link>
                ) : null}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-border px-5 py-4">
                {!hydrated ? null : isAuthenticated && user ? (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setMobileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
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
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full gap-1.5">
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
