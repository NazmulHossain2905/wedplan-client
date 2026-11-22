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
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  CalendarCheck2,
  CalendarRange,
  CreditCard,
  FolderOpen,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, ReactNode, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: Record<string, NavItem[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/customer/bookings",
      label: "My Bookings",
      icon: CalendarCheck2,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/vendor/services",
      label: "My Services",
      icon: FolderOpen,
    },
    {
      href: "/dashboard/vendor/services/new",
      label: "Add Service",
      icon: PlusCircle,
    },
    {
      href: "/dashboard/vendor/bookings",
      label: "Booking Requests",
      icon: CalendarRange,
    },
    {
      href: "/dashboard/vendor/subscription",
      label: "Subscription",
      icon: CreditCard,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    {
      href: "/dashboard/admin/services",
      label: "Manage Services",
      icon: FolderOpen,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: BadgeDollarSign,
    },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
};

const PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
  bookings: "My Bookings",
  services: "My Services",
  new: "Add Service",
  edit: "Edit Service",
  subscription: "Subscription",
  users: "Manage Users",
  transactions: "Transactions",
  profile: "Profile Settings",
};

function NavLinks({
  items,
  roleHome,
  onNavigate,
}: {
  items: NavItem[];
  roleHome: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (pathname === href) return true;
    // "Add Service" only matches its exact route
    if (href.endsWith("/new")) return false;
    // Role dashboard roots only match exactly
    if (href === roleHome) return false;
    // Nested routes (e.g. edit pages) keep their parent active,
    // except the "new" child which belongs to the Add Service item.
    if (pathname.startsWith(href + "/new")) return false;
    return pathname.startsWith(href + "/");
  };

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-burgundy text-white shadow-sm"
              : "text-foreground/75 hover:bg-rose-tint hover:text-burgundy",
          )}
        >
          <item.icon aria-hidden className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function RoleHeader({ role }: { role: string }) {
  const labels: Record<
    string,
    { title: string; icon: LucideIcon; className: string }
  > = {
    vendor: {
      title: "Vendor Area",
      icon: CalendarRange,
      className: "bg-rose-tint text-burgundy",
    },
    customer: {
      title: "Customer Area",
      icon: CalendarCheck2,
      className: "bg-sage-tint text-[#4d5c44]",
    },
    admin: {
      title: "Admin Area",
      icon: ShieldCheck,
      className: "bg-[#3d2f52] text-white",
    },
  };
  const cfg = labels[role] ?? labels.customer;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-3 text-xs font-semibold",
        cfg.className,
      )}
    >
      <cfg.icon aria-hidden className="size-3.5" />
      {cfg.title}
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Breadcrumbs derived from the path
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: PATH_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const navItems = user ? (NAV[user.role] ?? []) : [];

  const sidebarInner = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo size="sm" />
      {user ? <RoleHeader role={user.role} /> : null}
      <NavLinks
        items={navItems}
        roleHome={user ? dashboardHomeForRole(user.role) : ""}
        onNavigate={onNavigate}
      />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card lg:block">
          {sidebarInner()}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile nav */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Open dashboard menu"
                  >
                    <Menu aria-hidden />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
                  {sidebarInner(() => setMobileNavOpen(false))}
                </SheetContent>
              </Sheet>

              <nav
                aria-label="Breadcrumb"
                className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex"
              >
                {crumbs.map((crumb, i) => (
                  <Fragment key={crumb.href}>
                    {i > 0 ? (
                      <span className="text-muted-foreground/60">/</span>
                    ) : null}
                    {i === crumbs.length - 1 ? (
                      <span className="truncate font-medium text-foreground">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="truncate text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </Fragment>
                ))}
              </nav>
              <span className="truncate text-sm font-medium text-foreground sm:hidden">
                {crumbs[crumbs.length - 1]?.label ?? "Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hydrated && user ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden text-burgundy sm:inline-flex"
                >
                  <Link href="/">View Site</Link>
                </Button>
              ) : null}
              {user ? (
                <UserMenu />
              ) : (
                <Skeleton className="size-9 rounded-full" />
              )}
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

/** Shared loading state for dashboard pages. */
export function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
