"use client";

import { cn } from "cn";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import * as React from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Subtle scroll-into-view reveal. Honours prefers-reduced-motion.
 *
 * Only the position is animated, never opacity: content must stay visible
 * even if the IntersectionObserver callback does not fire (e.g. content that
 * is already in view on load, or a hydration hiccup). A stuck opacity:0 would
 * leave an empty white section.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      initial={reduce ? undefined : { y }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </Comp>
  );
}

const staggerChild: Variants = {
  hidden: { y: 20 },
  show: {
    y: 0,
    transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

/** Staggers direct children on scroll into view. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={cn("grid", className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  );
}
