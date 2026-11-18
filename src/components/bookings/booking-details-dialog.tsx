"use client";

import { BookingStatusBadge } from "@/components/shared/badges";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, initials } from "@/lib/helpers";
import type { Booking, Service, User } from "@/types";
import { CalendarDays, MapPin, MessageSquare } from "lucide-react";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  service?: Service;
  customer?: User;
  vendor?: User;
  onClose: () => void;
}

export function BookingDetailsDialog({
  booking,
  service,
  customer,
  vendor,
  onClose,
}: BookingDetailsDialogProps) {
  return (
    <Dialog open={Boolean(booking)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {booking ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                Booking Details
              </DialogTitle>
              <DialogDescription>
                Requested on {formatDate(booking.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {service ? (
                <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-3">
                  <img
                    src={service.images?.[0]}
                    alt={service.serviceName}
                    className="size-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {service.serviceName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {service.category}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    <CalendarDays aria-hidden className="size-3.5" /> Event Date
                  </p>
                  <p className="font-medium">{formatDate(booking.eventDate)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    <MapPin aria-hidden className="size-3.5" /> Event Location
                  </p>
                  <p className="font-medium">{booking.eventLocation}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Status
                </p>
                <BookingStatusBadge status={booking.status} />
              </div>

              {customer ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Customer
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar className="size-9 border border-border">
                      <AvatarImage src={customer.image} alt={customer.name} />
                      <AvatarFallback className="bg-rose-tint text-burgundy">
                        {initials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {customer.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {vendor ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Vendor
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Avatar className="size-9 border border-border">
                      <AvatarImage src={vendor.image} alt={vendor.name} />
                      <AvatarFallback className="bg-rose-tint text-burgundy">
                        {initials(vendor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {vendor.businessName ?? vendor.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {vendor.name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <Separator />

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <MessageSquare aria-hidden className="size-4 text-rose" />{" "}
                  Customer Message
                </p>
                <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
                  {booking.message
                    ? `“${booking.message}”`
                    : "No message was attached to this request."}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Request submitted {formatDateTime(booking.createdAt)}
              </p>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
