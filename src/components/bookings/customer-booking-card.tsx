"use client";

import { BookingDetailsDialog } from "@/components/bookings/booking-details-dialog";
import { BookingStatusBadge, PremiumBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatBDT, formatDate, initials } from "@/lib/helpers";
import type { Booking, Service, User } from "@/types";
import { Ban, CalendarDays, Eye, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerBookingCardProps {
  booking: Booking;
  service?: Service;
  vendor?: User;
  /** Called after the booking is cancelled so the parent can reload its list. */
  onChanged?: () => void;
}

export function CustomerBookingCard({
  booking,
  service,
  vendor,
  onChanged,
}: CustomerBookingCardProps) {
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel =
    booking.status === "pending" && user?.id === booking.customerId;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.cancelBooking(booking.id);
      setCancelOpen(false);
      toast.success("Booking request cancelled.", {
        description:
          "The vendor has been notified that you withdrew this request.",
      });
      onChanged?.();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not cancel this booking.",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <img
          src={service?.images?.[0]}
          alt={service?.serviceName ?? "Service"}
          loading="lazy"
          className="h-32 w-full shrink-0 rounded-lg object-cover sm:h-24 sm:w-32"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug text-foreground">
              {service?.serviceName ?? "Service unavailable"}
            </h3>
            <BookingStatusBadge status={booking.status} />
          </div>

          {vendor ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="size-5 border border-border">
                <AvatarImage src={vendor.image} alt="" />
                <AvatarFallback className="text-[8px]">
                  {initials(vendor.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {vendor.businessName ?? vendor.name}
              </span>
              {vendor.subscriptionPlan === "premium" ? (
                <PremiumBadge compact />
              ) : null}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-4 text-rose" />
              {formatDate(booking.eventDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 truncate">
              <MapPin aria-hidden className="size-4 text-rose" />
              <span className="truncate">{booking.eventLocation}</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Requested on {formatDate(booking.createdAt)}
            {service ? ` · ${formatBDT(service.price)}` : ""}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-row gap-2 sm:w-40 sm:flex-col sm:self-center">
          <Button
            size="sm"
            className="h-10 flex-1 gap-1.5 rounded-full bg-burgundy px-4 font-medium text-white hover:bg-burgundy-deep sm:w-full sm:flex-none"
            onClick={() => setDetailsOpen(true)}
          >
            <Eye aria-hidden className="size-4" /> View Details
          </Button>
          {canCancel ? (
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex-1 gap-1.5 rounded-full border-red-200 bg-red-50 px-4 font-medium text-red-700 hover:bg-red-100 hover:text-red-800 sm:w-full sm:flex-none"
              onClick={() => setCancelOpen(true)}
              disabled={cancelling}
            >
              {cancelling ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <Ban aria-hidden className="size-4" />
              )}
              {cancelling ? "Cancelling…" : "Cancel Request"}
            </Button>
          ) : null}
        </div>
      </article>

      <BookingDetailsDialog
        booking={detailsOpen ? booking : null}
        service={service}
        vendor={vendor}
        customer={undefined}
        onClose={() => setDetailsOpen(false)}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(o) => !o && !cancelling && setCancelOpen(false)}
        title="Cancel this booking request?"
        description={`Your request for ${service?.serviceName ?? "this service"} on ${formatDate(booking.eventDate)} will be withdrawn. This cannot be undone.`}
        confirmLabel="Cancel Booking"
        loadingLabel="Cancelling…"
        loading={cancelling}
        destructive
        onConfirm={() => void handleCancel()}
      />
    </>
  );
}
