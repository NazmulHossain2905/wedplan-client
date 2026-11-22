"use client";

import { BookingDetailsDialog } from "@/components/bookings/booking-details-dialog";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { BookingStatusBadge } from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError, type BookingWithDetails } from "@/lib/api";
import { formatBDT, formatDate, initials } from "@/lib/helpers";
import {
  CalendarDays,
  CalendarRange,
  Check,
  Loader2,
  MapPin,
  MessageSquare,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const STATUS_TABS = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "cancelled",
] as const;

export default function VendorBookingsPage() {
  return (
    <DashboardPage>
      <VendorBookings />
    </DashboardPage>
  );
}

function VendorBookings() {
  const { user } = useAuth();

  const [data, setData] = React.useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [tab, setTab] = React.useState<string>("pending");
  const [viewing, setViewing] = React.useState<BookingWithDetails | null>(null);
  const [responding, setResponding] = React.useState<{
    booking: BookingWithDetails;
    action: "accepted" | "rejected";
  } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadBookings() {
      try {
        const res = await api.vendorBookings();
        if (!cancelled) setData(res.bookings);
      } catch {
        // Leave whatever is already on screen.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const myBookings = React.useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data],
  );

  const counts = React.useMemo(() => {
    const map: Record<string, number> = { all: myBookings.length };
    for (const t of STATUS_TABS) {
      if (t !== "all") map[t] = myBookings.filter((b) => b.status === t).length;
    }
    return map;
  }, [myBookings]);

  const filtered =
    tab === "all" ? myBookings : myBookings.filter((b) => b.status === tab);

  const handleRespond = async () => {
    if (!responding || busyId) return;
    const { booking, action } = responding;
    setBusyId(booking.id);
    try {
      await api.respondToBooking(booking.id, action);
      setResponding(null);
      const customerName = booking.customer?.name ?? "The customer";
      toast.success(
        action === "accepted"
          ? "Booking request accepted."
          : "Booking request rejected.",
        {
          description:
            action === "accepted"
              ? `${customerName} will see this update in their dashboard.`
              : "The customer will be notified in their dashboard.",
        },
      );
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update this booking request.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Booking Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and manage customer booking requests for your services. Only
          pending requests can be accepted or rejected.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="h-auto w-max gap-1 bg-muted/70 p-1">
            {STATUS_TABS.map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="gap-1.5 px-3.5 py-1.5 capitalize data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                {t}
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums data-[state=active]:bg-rose-tint">
                  {counts[t] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {isLoading && myBookings.length === 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        myBookings.length === 0 ? (
          <EmptyState
            icon={<CalendarRange aria-hidden />}
            title="No booking requests yet"
            description="When customers request your services, their bookings will appear here for you to review."
            action={{
              label: "Add a service",
              href: "/dashboard/vendor/services/new",
            }}
          />
        ) : (
          <EmptyState
            icon={<CalendarRange aria-hidden />}
            title={`No ${tab} requests`}
            description="Try another status tab to see your other booking requests."
          />
        )
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((booking) => {
            const service = booking.service;
            const customer = booking.customer;
            const isPending = booking.status === "pending";
            return (
              <article
                key={booking.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-11 border border-border">
                      <AvatarImage
                        src={customer?.image}
                        alt={customer?.name ?? "Customer"}
                      />
                      <AvatarFallback className="bg-rose-tint text-burgundy">
                        {initials(customer?.name ?? "C")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {customer?.name ?? "Customer"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer?.email}
                      </p>
                    </div>
                  </div>
                  <BookingStatusBadge
                    status={booking.status}
                    className="shrink-0"
                  />
                </div>

                <div className="rounded-lg border border-border bg-muted/40 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {service?.serviceName ?? "Service unavailable"}
                  </p>
                  {service ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {service.category} · {formatBDT(service.price)}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden className="size-4 text-rose" />
                    {formatDate(booking.eventDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin aria-hidden className="size-4 text-rose" />
                    <span className="max-w-52 truncate">
                      {booking.eventLocation}
                    </span>
                  </span>
                </div>

                {booking.message ? (
                  <p className="flex gap-2 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                    <MessageSquare
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0 text-rose"
                    />
                    <span className="line-clamp-3">{booking.message}</span>
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3.5">
                  <p className="text-xs text-muted-foreground">
                    Requested {formatDate(booking.createdAt)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewing(booking)}
                    >
                      View Details
                    </Button>
                    {isPending ? (
                      <>
                        <Button
                          size="sm"
                          className="gap-1 bg-emerald-700 text-white hover:bg-emerald-700/90"
                          onClick={() =>
                            setResponding({ booking, action: "accepted" })
                          }
                          disabled={busyId === booking.id}
                        >
                          {busyId === booking.id &&
                          responding?.action === "accepted" ? (
                            <Loader2
                              aria-hidden
                              className="size-3.5 animate-spin"
                            />
                          ) : (
                            <Check aria-hidden className="size-3.5" />
                          )}{" "}
                          {busyId === booking.id &&
                          responding?.action === "accepted"
                            ? "Accepting…"
                            : "Accept"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() =>
                            setResponding({ booking, action: "rejected" })
                          }
                          disabled={busyId === booking.id}
                        >
                          {busyId === booking.id &&
                          responding?.action === "rejected" ? (
                            <Loader2
                              aria-hidden
                              className="size-3.5 animate-spin"
                            />
                          ) : (
                            <X aria-hidden className="size-3.5" />
                          )}{" "}
                          {busyId === booking.id &&
                          responding?.action === "rejected"
                            ? "Rejecting…"
                            : "Reject"}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <BookingDetailsDialog
        booking={viewing}
        service={viewing?.service}
        customer={viewing?.customer}
        vendor={user ?? undefined}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        open={Boolean(responding)}
        onOpenChange={(o) => !o && !busyId && setResponding(null)}
        title={
          responding?.action === "accepted"
            ? "Accept this booking request?"
            : "Reject this booking request?"
        }
        description={
          responding?.action === "accepted"
            ? "The customer will be notified that their booking is confirmed. Accepted requests cannot be processed again."
            : "The customer will be notified that their request was declined. Rejected requests cannot be processed again."
        }
        confirmLabel={
          responding?.action === "accepted"
            ? "Accept Booking"
            : "Reject Booking"
        }
        destructive={responding?.action === "rejected"}
        loadingLabel={
          responding?.action === "accepted" ? "Accepting…" : "Rejecting…"
        }
        loading={Boolean(responding && busyId === responding.booking.id)}
        onConfirm={() => void handleRespond()}
      />
    </div>
  );
}
