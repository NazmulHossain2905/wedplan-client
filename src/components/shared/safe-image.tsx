"use client";

import * as React from "react";

/**
 * Image with a graceful wedding-themed fallback: if the hosted image fails to
 * load (offline CDN, deleted asset), a soft placeholder is shown instead of a
 * broken image icon.
 */

const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#6b5b63"/><text x="200" y="150" font-family="Georgia, serif" font-size="20" fill="#f3eefa" text-anchor="middle">WedPlan</text></svg>`,
)}`;

export function SafeImage({
  src,
  alt,
  className,
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = React.useState(false);

  return (
    <img
      src={failed || !src ? FALLBACK_SVG : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
