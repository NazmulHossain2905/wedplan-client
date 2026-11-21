"use client";

import { RoleBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { dashboardHomeForRole } from "@/lib/constants";
import { initials } from "@/lib/helpers";
import { LayoutDashboard, Loader2, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
        <DropdownMenuItem
          variant="destructive"
          disabled={signingOut}
          onClick={() => {
            if (signingOut) return;
            setSigningOut(true);
            void (async () => {
              await signOut();
              onNavigate?.();
              toast.success("You have been signed out.");
              router.replace("/");
            })();
          }}
        >
          {signingOut ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : (
            <LogOut aria-hidden className="size-4" />
          )}
          {signingOut ? "Signing out…" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
