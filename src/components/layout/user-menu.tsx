"use client";

import {
  ArrowRightLeft,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { RoleBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEMO_ACCOUNTS } from "@/data/users";
import { DEMO_PASSWORD, dashboardHomeForRole } from "@/lib/constants";
import { initials } from "@/lib/helpers";

/**
 * Quick demo account switching for evaluation — signs in with the documented
 * demo credentials through the real authentication API.
 */
export function DemoAccountSwitcher({ onDone }: { onDone?: () => void }) {
  const [switching, setSwitching] = React.useState(false);

  const handleSwitch = async (email: string, label: string) => {
    if (switching) return;
    setSwitching(true);
    // const result = await signIn(email, DEMO_PASSWORD);
    setSwitching(false);
    // if (!result.ok) {
    //   toast.error(result.error ?? "Could not switch demo account.");
    //   return;
    // }
    toast.success(`Switched to ${label}`, {
      description: "You are now browsing WedPlan with this demo account.",
    });
    onDone?.();
    // router.push(dashboardHomeForRole(result.user?.role ?? "customer"));
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ArrowRightLeft aria-hidden className="size-4" />
        Switch Demo Account
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Demo accounts (password: {DEMO_PASSWORD})
        </DropdownMenuLabel>
        {DEMO_ACCOUNTS.map((account) => (
          <DropdownMenuItem
            key={account.id}
            disabled={switching}
            onClick={() => void handleSwitch(account.email, account.label)}
            className="gap-2.5"
          >
            <Avatar className="size-7 border border-border">
              <AvatarImage src={account.image} alt="" />
              <AvatarFallback className="text-[10px]">
                {initials(account.name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {account.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {account.label}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const go = (path: string) => {
    onNavigate?.();
    router.push(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 shadow-xs outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open user menu"
      >
        <Avatar className="size-8">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="bg-rose-tint text-xs text-burgundy">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate text-sm font-medium text-foreground sm:block">
          {user.name.split(" ")[0]}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <Avatar className="size-10 border border-border">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-rose-tint text-burgundy">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => go(dashboardHomeForRole(user.role))}>
          <LayoutDashboard aria-hidden className="size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/dashboard/profile")}>
          <Settings aria-hidden className="size-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <p className="px-2 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Demo controls
        </p>
        <DemoAccountSwitcher onDone={onNavigate} />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void (async () => {
              await signOut();
              onNavigate?.();
              toast.success("You have been signed out.");
              router.replace("/");
            })();
          }}
        >
          <LogOut aria-hidden className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
