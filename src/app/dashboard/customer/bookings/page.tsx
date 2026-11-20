"use client";

import { CustomerBookingCard } from "@/components/bookings/customer-booking-card";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { api, type BookingWithDetails } from "@/lib/api";
import type { BookingStatus } from "@/types";
import { CalendarCheck2, Compass } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STATUS_TABS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CustomerBookingsPage() {
  return (
    <DashboardPage role="customer">
      <CustomerBookings />
    </DashboardPage>
  );
}

function CustomerBookings() {
  const { user } = useAuth();

  const [data, setData] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  // Bumped after a booking is cancelled so the list reloads.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadBookings() {
      try {
        const res = await api.bookings();
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

  const myBookings = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data],
  );

  const filtered =
    tab === "all" ? myBookings : myBookings.filter((b) => b.status === tab);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: myBookings.length };
    for (const t of STATUS_TABS) {
      if (t.value !== "all")
        map[t.value] = myBookings.filter((b) => b.status === t.value).length;
    }
    return map;
  }, [myBookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every booking request you have sent to vendors — pending
          requests can be cancelled anytime.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="h-auto w-max gap-1 bg-muted/70 p-1">
            {STATUS_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-1.5 px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                {t.label}
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums data-[state=active]:bg-rose-tint">
                  {counts[t.value] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {isLoading && myBookings.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        myBookings.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck2 aria-hidden />}
            title="No booking requests yet"
            description="When you find a service you love, send a booking request and track its status here."
            action={{ label: "Explore Services", href: "/services" }}
          />
        ) : (
          <EmptyState
            icon={<Compass aria-hidden />}
            title={`No ${tab} bookings`}
            description="Try a different status tab to see your other booking requests."
            action={{ label: "Explore more services", href: "/services" }}
          />
        )
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <CustomerBookingCard
              key={booking.id}
              booking={booking}
              service={booking.service}
              vendor={booking.vendor}
              onChanged={() => setReloadKey((key) => key + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
