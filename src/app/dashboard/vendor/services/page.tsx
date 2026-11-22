"use client";

import { DashboardPage } from "@/components/dashboard/dashboard-page";
import {
  AvailabilityBadge,
  ServiceStatusBadge,
} from "@/components/shared/badges";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import { FREE_PLAN } from "@/lib/constants";
import { formatBDT, formatDate } from "@/lib/helpers";
import type { Service } from "@/types";
import {
  FolderOpen,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

export default function VendorServicesPage() {
  return (
    <DashboardPage>
      <VendorServices />
    </DashboardPage>
  );
}

type VendorStats = {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  currentPlan: "free" | "premium";
  planExpiresAt: string | null;
};

function VendorServices() {
  const { user } = useAuth();
  const router = useRouter();

  const [myServices, setMyServices] = React.useState<Service[]>([]);
  const [stats, setStats] = React.useState<VendorStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);

  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState("all");
  const [viewing, setViewing] = React.useState<Service | null>(null);
  const [deleting, setDeleting] = React.useState<Service | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.role !== "vendor") return;

    let cancelled = false;

    async function loadServices() {
      try {
        const [servicesRes, statsRes] = await Promise.all([
          api.vendorServices(),
          api.vendorStats(),
        ]);
        if (cancelled) return;
        setMyServices(servicesRes.services);
        setStats(statsRes);
      } catch {
        // Leave the current list on screen.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const activeCount =
    stats?.activeServices ??
    myServices.filter((s) => s.status === "approved" && s.isAvailable).length;
  const isPremium =
    (stats?.currentPlan ?? user?.subscriptionPlan) === "premium";

  const filtered = React.useMemo(() => {
    return myServices
      .filter((s) => {
        if (
          search.trim() &&
          !s.serviceName.toLowerCase().includes(search.trim().toLowerCase())
        )
          return false;
        if (tab === "active" && !(s.status === "approved" && s.isAvailable))
          return false;
        if (tab === "pending" && s.status !== "pending") return false;
        if (tab === "rejected" && s.status !== "rejected") return false;
        if (tab === "inactive" && (s.isAvailable || s.status !== "approved"))
          return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [myServices, search, tab]);

  const handleToggleAvailability = async (service: Service, next: boolean) => {
    setBusyId(service.id);
    try {
      await api.setServiceAvailability(service.id, next);
      toast.success(
        next
          ? "Service is now active and visible to customers."
          : "Service set to inactive — hidden from customers.",
      );
      setReloadKey((key) => key + 1);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not update availability.";
      toast.error(message, {
        description: message.includes("Free plan")
          ? "Upgrade to Premium for unlimited active services."
          : undefined,
        action: message.includes("Free plan")
          ? {
              label: "Upgrade",
              onClick: () => router.push("/dashboard/vendor/subscription"),
            }
          : undefined,
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting || busyId) return;
    const name = deleting.serviceName;
    setBusyId(deleting.id);
    try {
      await api.deleteService(deleting.id);
      setDeleting(null);
      toast.success(`"${name}" has been deleted.`, {
        description: "Associated booking requests were also removed.",
      });
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not delete the service.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            My Services
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {myServices.length}{" "}
            {myServices.length === 1 ? "service" : "services"} total ·{" "}
            {activeCount} active
            {!isPremium
              ? ` (Free plan limit: ${FREE_PLAN.maxActiveServices})`
              : ""}
          </p>
        </div>
        <Button asChild className="gap-1.5 shadow-sm">
          <Link href="/dashboard/vendor/services/new">
            <PlusCircle aria-hidden className="size-4" /> Add Service
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search your services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search your services"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto w-max gap-1 bg-muted/70 p-1">
              <TabsTrigger
                value="all"
                className="px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                Rejected
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:text-burgundy"
              >
                Inactive
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {isLoading && myServices.length === 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-44 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        myServices.length === 0 ? (
          <EmptyState
            icon={<FolderOpen aria-hidden />}
            title="No services yet"
            description="Publish your first wedding service — it will go live after admin approval."
            action={{
              label: "Add Your First Service",
              href: "/dashboard/vendor/services/new",
            }}
          />
        ) : (
          <EmptyState
            icon={<Search aria-hidden />}
            title="No services match"
            description="Try a different search term or status filter."
          />
        )
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((service) => (
            <article
              key={service.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-xs sm:flex-row sm:p-5"
            >
              <img
                src={service.images[0]}
                alt={service.serviceName}
                loading="lazy"
                className="h-36 w-full shrink-0 rounded-lg object-cover sm:h-28 sm:w-40"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-serif text-lg font-semibold text-foreground">
                    {service.serviceName}
                  </h3>
                  <ServiceStatusBadge status={service.status} />
                  <AvailabilityBadge available={service.isAvailable} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {service.category}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-burgundy">
                    {formatBDT(service.price)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin aria-hidden className="size-3.5 text-rose" />
                    {service.location}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(service.createdAt)} ·{" "}
                  {service.images.length}{" "}
                  {service.images.length === 1 ? "image" : "images"}
                </p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1.5">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={service.isAvailable}
                      disabled={busyId === service.id}
                      onCheckedChange={(v) =>
                        void handleToggleAvailability(service, v)
                      }
                      aria-label={`Toggle availability for ${service.serviceName}`}
                    />
                    {busyId === service.id ? "Updating…" : "Available"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewing(service)}
                    >
                      View
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <Link
                        href={`/dashboard/vendor/services/${service.id}/edit`}
                      >
                        <Pencil aria-hidden className="size-3.5" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 text-destructive hover:bg-red-50 hover:text-destructive"
                      onClick={() => setDeleting(service)}
                      aria-label={`Delete ${service.serviceName}`}
                    >
                      <Trash2 aria-hidden className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View dialog */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(o) => !o && setViewing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {viewing ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  {viewing.serviceName}
                </DialogTitle>
                <DialogDescription>
                  Created {formatDate(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {viewing.images.slice(0, 6).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${viewing.serviceName} image ${i + 1}`}
                      className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <ServiceStatusBadge status={viewing.status} />
                  <AvailabilityBadge available={viewing.isAvailable} />
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {viewing.category}
                  </span>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {viewing.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase text-muted-foreground">
                      Price
                    </p>
                    <p className="mt-0.5 font-semibold text-burgundy">
                      {formatBDT(viewing.price)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase text-muted-foreground">
                      Location
                    </p>
                    <p className="mt-0.5 font-medium">{viewing.location}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {viewing.status === "pending"
                    ? "This service is awaiting administrator review and is not yet visible to customers."
                    : viewing.status === "rejected"
                      ? "This service was rejected by an administrator and is hidden from customers. Edit and improve it, then contact support."
                      : viewing.isAvailable
                        ? "This service is live and visible to customers."
                        : "This service is approved but currently inactive — customers cannot see it."}
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && !busyId && setDeleting(null)}
        title="Delete this service?"
        description={`"${deleting?.serviceName}" will be permanently removed along with its booking requests. This cannot be undone.`}
        confirmLabel="Delete Service"
        loadingLabel="Deleting…"
        loading={Boolean(deleting && busyId === deleting.id)}
        destructive
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
