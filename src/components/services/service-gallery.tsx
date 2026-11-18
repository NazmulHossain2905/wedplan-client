 
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Expand, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ServiceGalleryProps {
  images: string[];
  serviceName: string;
}

export function ServiceGallery({ images, serviceName }: ServiceGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const safeImages = images.length > 0 ? images : [];
  const go = (dir: 1 | -1) => {
    if (safeImages.length < 2) return;
    setActiveIndex((i) => (i + dir + safeImages.length) % safeImages.length);
  };

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <span className="flex flex-col items-center gap-2">
          <ImageOff aria-hidden className="size-8" />
          <span className="text-sm">No images available</span>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted shadow-xs">
        <img
          src={safeImages[activeIndex]}
          alt={`${serviceName} — photo ${activeIndex + 1} of ${safeImages.length}`}
          className="size-full cursor-zoom-in object-cover"
          onClick={() => setLightboxOpen(true)}
        />
        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open image in full screen"
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-foreground shadow-md backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Expand aria-hidden className="size-4" />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {activeIndex + 1} / {safeImages.length}
        </span>
      </div>

      {safeImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5" role="tablist" aria-label="Service image thumbnails">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all",
                i === activeIndex
                  ? "border-burgundy shadow-sm"
                  : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              <img src={src} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-none bg-black/90 p-2 sm:p-4">
          <DialogTitle className="sr-only">{serviceName} — full screen image</DialogTitle>
          <div className="relative">
            <img
              src={safeImages[activeIndex]}
              alt={`${serviceName} — enlarged photo`}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  <ChevronRight aria-hidden className="size-6" />
                </button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
