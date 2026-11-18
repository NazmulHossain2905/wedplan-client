import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "rose" | "sage" | "amber" | "red";
  className?: string;
}

const tones = {
  default: "bg-primary/10 text-primary",
  rose: "bg-rose-tint text-burgundy",
  sage: "bg-sage-tint text-[#4d5c44]",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

export function StatCard({ title, value, icon: Icon, hint, tone = "default", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 font-serif text-2xl font-semibold leading-none text-foreground sm:text-3xl">
          {value}
        </p>
        {hint ? <p className="mt-1.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon aria-hidden className="size-5" />
      </div>
    </div>
  );
}
