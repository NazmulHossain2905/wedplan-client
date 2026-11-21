"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SafeImage } from "@/components/shared/safe-image";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatBDT, initials, todayStr } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { validateBooking } from "@/lib/validations";
import type { Service, User } from "@/types";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type SyntheticEvent, useEffect, useState } from "react";
import { toast } from "sonner";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service;
  vendor?: User;
}

export function BookingDialog({
  open,
  onOpenChange,
  service,
  vendor,
}: BookingDialogProps) {
  const { user } = useAuth();
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; location?: string }>(
    {},
  );

  useEffect(() => {
    if (open) {
      setEventDate("");
      setEventLocation("");
      setMessage("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!user) return;

    const validationError = validateBooking({ eventDate, eventLocation });
    if (validationError) {
      setErrors({
        date: !eventDate
          ? "Event date is required."
          : eventDate < todayStr()
            ? "Event date cannot be in the past."
            : undefined,
        location: !eventLocation.trim()
          ? "Event location is required."
          : undefined,
      });
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await api.createBooking({
        serviceId: service.id,
        eventDate,
        eventLocation,
        message,
      });
      toast.success("Booking request sent!", {
        description: `${vendor?.businessName ?? "The vendor"} will review your request and respond soon.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not submit your booking request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl border-border/70 bg-card p-0 shadow-2xl sm:max-w-[34rem] max-sm:bottom-0 max-sm:left-0 max-sm:top-auto max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-3xl"
      >
        <div className="flex max-h-[92svh] flex-col sm:max-h-[min(88vh,780px)]">
          {/* Header — fixed while the form scrolls */}
          <header className="relative shrink-0 border-b border-border/70 bg-linear-to-br from-rose-tint/80 via-card to-card px-5 pb-5 pt-4 sm:px-6 sm:pt-6">
            <div
              className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden"
              aria-hidden
            />
            <DialogHeader className="pr-8 text-left">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-burgundy ring-1 ring-rose-soft/60">
                <Sparkles aria-hidden className="size-3" />
                Booking request
              </span>
              <DialogTitle className="mt-1 font-serif text-2xl font-semibold text-foreground sm:text-[1.7rem]">
                Request your date
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Tell the vendor when and where. They&apos;ll review your request
                and get back to you in your dashboard.
              </DialogDescription>
            </DialogHeader>
          </header>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
            {/* Service summary */}
            <div className="flex gap-3 rounded-2xl border border-border/80 bg-muted/30 p-3 sm:gap-4 sm:p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-28">
                <SafeImage
                  src={service.images[0]}
                  alt={service.serviceName}
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="truncate font-serif text-base font-semibold leading-snug text-foreground sm:text-lg">
                  {service.serviceName}
                </p>

                {vendor ? (
                  <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
                    <Avatar className="size-5 border border-border">
                      <AvatarImage src={vendor.image} alt={vendor.name} />
                      <AvatarFallback className="bg-rose-tint text-[9px] text-burgundy">
                        {initials(vendor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium text-muted-foreground">
                      {vendor.businessName ?? vendor.name}
                    </span>
                  </div>
                ) : null}

                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin aria-hidden className="size-3.5 shrink-0 text-rose" />
                  <span className="truncate">{service.location}</span>
                </p>

                <p className="mt-2 w-fit rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold text-burgundy ring-1 ring-rose-soft/60">
                  {formatBDT(service.price)}
                </p>
              </div>
            </div>

            <form
              id="booking-form"
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-6 space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="booking-date" className="text-sm font-medium">
                  Event Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="booking-date"
                    type="date"
                    min={todayStr()}
                    value={eventDate}
                    onChange={(e) => {
                      setEventDate(e.target.value);
                      setErrors((p) => ({ ...p, date: undefined }));
                    }}
                    aria-invalid={Boolean(errors.date)}
                    className={cn(
                      "h-11 pl-9",
                      errors.date && "border-destructive focus-visible:ring-destructive/30",
                    )}
                    required
                  />
                </div>
                {errors.date ? (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle aria-hidden className="size-3.5" />
                    {errors.date}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Choose the day of your wedding or event.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-location" className="text-sm font-medium">
                  Event Location <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <MapPin
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="booking-location"
                    placeholder="e.g. Gulshan Community Centre, Dhaka"
                    value={eventLocation}
                    onChange={(e) => {
                      setEventLocation(e.target.value);
                      setErrors((p) => ({ ...p, location: undefined }));
                    }}
                    aria-invalid={Boolean(errors.location)}
                    className={cn(
                      "h-11 pl-9",
                      errors.location && "border-destructive focus-visible:ring-destructive/30",
                    )}
                    maxLength={140}
                    required
                  />
                </div>
                {errors.location ? (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle aria-hidden className="size-3.5" />
                    {errors.location}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="booking-message" className="text-sm font-medium">
                    Additional Message
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {message.length}/600
                  </span>
                </div>
                <Textarea
                  id="booking-message"
                  placeholder="Share your vision, guest count, or any special requests…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-24 resize-none"
                  rows={4}
                  maxLength={600}
                />
              </div>

              <div className="flex gap-2.5 rounded-xl border border-sage/30 bg-sage-tint/50 p-3 text-xs leading-relaxed text-foreground/80">
                <ShieldCheck
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-sage"
                />
                <p>
                  <span className="font-semibold">No payment now.</span>{" "}
                  Sending this request is free — discuss the details with the
                  vendor first.
                </p>
              </div>
            </form>
          </div>

          {/* Footer — always visible */}
          <footer className="shrink-0 border-t border-border/70 bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="h-11 flex-1 rounded-full sm:min-w-28 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="booking-form"
                disabled={submitting}
                className="h-11 flex-1 rounded-full bg-burgundy text-white shadow-sm hover:bg-burgundy-deep sm:min-w-52 sm:flex-none"
              >
                {submitting ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Sending request…
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </Button>
            </div>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
