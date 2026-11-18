import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  tone?: "default" | "light";
}

const sizes = {
  sm: { mark: "size-8", text: "text-lg", icon: "size-4" },
  md: { mark: "size-9", text: "text-xl", icon: "size-4" },
  lg: { mark: "size-11", text: "text-2xl", icon: "size-5" },
};

export function Logo({
  className,
  size = "md",
  linked = true,
  tone = "default",
}: LogoProps) {
  const s = sizes[size];
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-linear-to-br from-burgundy to-[#8a5566] text-white shadow-sm",
          s.mark,
        )}
        aria-hidden
      >
        <Heart className={cn("fill-current", s.icon)} />
      </span>
      <span
        className={cn(
          "font-serif font-semibold tracking-tight",
          s.text,
          tone === "light" ? "text-white" : "text-foreground",
        )}
      >
        Wed<span className="text-rose">Plan</span>
      </span>
    </span>
  );
  if (!linked) return content;
  return (
    <Link
      href="/"
      aria-label="WedPlan — home"
      className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
