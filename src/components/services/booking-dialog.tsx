"use client";

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
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatBDT, todayStr } from "@/lib/helpers";
import { validateBooking } from "@/lib/validations";
import type { Service, User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin } from "lucide-react";
import { SyntheticEvent, useEffect, useState } from "react";
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
  const queryClient = useQueryClient();
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
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Request Booking
          </DialogTitle>
          <DialogDescription>
            Send a booking request to the vendor — they will review and respond
            in your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-3">
          <img
            src={service.images[0]}
            alt={service.serviceName}
            className="size-16 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {service.serviceName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {vendor?.businessName ?? vendor?.name} · {service.location}
            </p>
            <p className="mt-0.5 font-semibold text-burgundy">
              {formatBDT(service.price)}
            </p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-date">
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
                className="pl-9"
                required
              />
            </div>
            {errors.date ? (
              <p className="text-xs text-destructive">{errors.date}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-location">
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
                className="pl-9"
                maxLength={140}
                required
              />
            </div>
            {errors.location ? (
              <p className="text-xs text-destructive">{errors.location}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-message">Additional Message</Label>
            <Textarea
              id="booking-message"
              placeholder="Share your vision, guest count, or any special requests…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={600}
            />
            <p className="text-right text-xs text-muted-foreground">
              {message.length}/600
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />{" "}
                  Sending request…
                </>
              ) : (
                "Submit Booking Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
