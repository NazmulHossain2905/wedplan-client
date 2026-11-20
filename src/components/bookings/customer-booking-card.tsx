"use client";

import { BookingDetailsDialog } from "@/components/bookings/booking-details-dialog";
import { BookingStatusBadge, PremiumBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatBDT, formatDate, initials } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import type { Booking, Service, User } from "@/types";
import { Ban, CalendarDays, Eye, MapPin } from "lucide-react";
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

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => setDetailsOpen(true)}
          >
            <Eye aria-hidden className="size-4" /> View Details
          </Button>
          {canCancel ? (
            <Button
              variant="destructive"
              size="sm"
              className={cn("flex-1 gap-1.5")}
              onClick={() => setCancelOpen(true)}
              disabled={cancelling}
            >
              <Ban aria-hidden className="size-4" /> Cancel
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
        onOpenChange={setCancelOpen}
        title="Cancel this booking request?"
        description={`Your request for ${service?.serviceName ?? "this service"} on ${formatDate(booking.eventDate)} will be withdrawn. This cannot be undone.`}
        confirmLabel="Cancel Booking"
        destructive
        onConfirm={() => void handleCancel()}
      />
    </>
  );
}
