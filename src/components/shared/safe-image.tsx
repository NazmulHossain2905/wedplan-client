"use client";

import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";
import * as React from "react";

/**
 * Optimized image with a graceful wedding-themed fallback: if the hosted
 * image fails to load (offline CDN, deleted asset), a soft placeholder is
 * shown instead of a broken image icon.
 *
 * Uses next/image so remote photos are resized, converted to a modern format
 * and cached — full-size uploads are several hundred KB each.
 */
const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#6b5b63"/><text x="200" y="150" font-family="Georgia, serif" font-size="20" fill="#f3eefa" text-anchor="middle">WedPlan</text></svg>`,
)}`;

type SafeImageProps = Omit<ImageProps, "src" | "alt" | "fill"> & {
  src?: string | null;
  alt?: string;
};

export function SafeImage({
  src,
  alt = "",
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  quality = 72,
  onError,
  ...rest
}: SafeImageProps) {
  // Store the failing URL instead of a boolean so navigating to a new image
  // (e.g. in the gallery) clears the fallback without an effect.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const failed = !src || failedSrc === src;

  return (
    <Image
      src={failed ? FALLBACK_SVG : src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      className={cn("object-cover", className)}
      onError={(event) => {
        setFailedSrc(src ?? null);
        onError?.(event);
      }}
      {...rest}
    />
  );
}
