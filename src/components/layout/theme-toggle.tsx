"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Switches between light and dark mode. The icon is only rendered after mount
 * because `next-themes` knows the resolved theme on the client, not during SSR.
 */
export function ThemeToggle({
  withLabel = false,
  className,
}: {
  withLabel?: boolean;
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="ghost"
      size={withLabel ? "default" : "icon"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-full transition-colors hover:bg-rose-tint hover:text-burgundy",
        withLabel ? "h-10 w-full justify-start gap-2.5 px-4" : "size-9",
        className,
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun aria-hidden className="size-4 shrink-0" />
        ) : (
          <Moon aria-hidden className="size-4 shrink-0" />
        )
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
      {withLabel ? (
        <span className="text-sm font-medium">
          {!mounted ? "Appearance" : isDark ? "Light mode" : "Dark mode"}
        </span>
      ) : null}
    </Button>
  );
}
