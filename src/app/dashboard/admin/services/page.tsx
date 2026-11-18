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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { CATEGORIES } from "@/data/categories";
import { useAdminServices } from "@/hooks/queries";
import { api, ApiError } from "@/lib/api";
import { formatBDT, formatDate } from "@/lib/helpers";
import type { Service } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  FolderOpen,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminServicesPage() {
  return (
    <DashboardPage role="admin">
      <AdminServices />
    </DashboardPage>
  );
}

function AdminServices() {
  const { user: admin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [viewing, setViewing] = useState<Service | null>(null);
  const [rejecting, setRejecting] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const { data, isLoading, isFetching } = useAdminServices(admin, {
    q: search.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const services = data?.services ?? [];

  const filtered = useMemo(
    () =>
      services
        .filter((s) => {
          if (availabilityFilter === "available" && !s.isAvailable)
            return false;
          if (availabilityFilter === "inactive" && s.isAvailable) return false;
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [services, availabilityFilter],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    void queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const handleApprove = async (service: Service) => {
    try {
      await api.adminSetServiceStatus(service.id, "approved");
      toast.success(
        `"${service.serviceName}" approved — it is now live on the marketplace.`,
      );
      invalidate();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not approve this service.",
      );
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejecting) return;
    const name = rejecting.serviceName;
    try {
      await api.adminSetServiceStatus(rejecting.id, "rejected");
      setRejecting(null);
      toast.success(`"${name}" rejected — it is hidden from customers.`);
      invalidate();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not reject this service.",
      );
    }
  };

  const handleToggleAvailability = async (service: Service, next: boolean) => {
    try {
      await api.adminSetServiceAvailability(service.id, next);
      toast.success(
        next
          ? `"${service.serviceName}" activated — visible to customers.`
          : `"${service.serviceName}" deactivated — hidden from customers.`,
      );
      invalidate();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not update availability.",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    const name = deleting.serviceName;
    try {
      await api.adminDeleteService(deleting.id);
      setDeleting(null);
      toast.success(`"${name}" has been deleted from the platform.`, {
        description: "Associated booking requests were also removed.",
      });
      invalidate();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not delete this service.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          Manage Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review submitted services before they go live. Only approved and
          active services are visible on the public Browse Services page.
        </p>
      </div>

      {/* Controls */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search services or vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search services"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full"
            aria-label="Filter by approval status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={availabilityFilter}
          onValueChange={setAvailabilityFilter}
        >
          <SelectTrigger className="w-full" aria-label="Filter by availability">
            <SelectValue placeholder="All availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All availability</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading && services.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen aria-hidden />}
          title="No services match"
          description="Try a different search term or filter combination."
        />
      ) : (
        <div
          className={`overflow-x-auto rounded-xl border border-border bg-card shadow-xs transition-opacity ${
            isFetching ? "opacity-60" : "opacity-100"
          }`}
          aria-busy={isFetching}
        >
          <table className="w-full min-w-250 text-sm">
            <caption className="sr-only">All submitted services</caption>
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Service
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Vendor
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Price
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Visible
                </th>
                <th scope="col" className="px-4 py-3.5 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service) => {
                const vendor = service.vendor;
                const publiclyVisible =
                  service.status === "approved" && service.isAvailable;
                return (
                  <tr
                    key={service.id}
                    className={
                      publiclyVisible
                        ? "border-b border-border/60 last:border-0"
                        : "border-b border-border/60 bg-muted/20 last:border-0"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={service.images[0]}
                          alt=""
                          loading="lazy"
                          className="size-10 shrink-0 rounded-md border border-border object-cover"
                        />
                        <div className="min-w-0">
                          <p className="max-w-44 truncate font-medium">
                            {service.serviceName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(service.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                      {vendor?.businessName ?? vendor?.name ?? "—"}
                    </td>
                    <td className="max-w-40 truncate px-4 py-3 text-muted-foreground">
                      {service.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-burgundy">
                      {formatBDT(service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <ServiceStatusBadge status={service.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.isAvailable}
                          disabled={service.status !== "approved"}
                          onCheckedChange={(v) =>
                            void handleToggleAvailability(service, v)
                          }
                          aria-label={`Toggle availability for ${service.serviceName}`}
                        />
                        <AvailabilityBadge available={service.isAvailable} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewing(service)}
                        >
                          View
                        </Button>
                        {service.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-emerald-700 text-white hover:bg-emerald-700/90"
                              onClick={() => void handleApprove(service)}
                            >
                              <CheckCircle2 aria-hidden className="size-3.5" />{" "}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => setRejecting(service)}
                            >
                              <XCircle aria-hidden className="size-3.5" />{" "}
                              Reject
                            </Button>
                          </>
                        ) : service.status === "rejected" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => void handleApprove(service)}
                            title="Re-approve this service"
                          >
                            <CheckCircle2 aria-hidden className="size-3.5" />{" "}
                            Approve
                          </Button>
                        ) : null}
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => setDeleting(service)}
                          aria-label={`Delete ${service.serviceName}`}
                        >
                          <Trash2 aria-hidden className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                  By{" "}
                  {viewing.vendor?.businessName ??
                    viewing.vendor?.name ??
                    "Unknown"}{" "}
                  · Submitted {formatDate(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {viewing.images.slice(0, 6).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <ServiceStatusBadge status={viewing.status} />
                  <AvailabilityBadge available={viewing.isAvailable} />
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {viewing.category}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                    {viewing.location}
                  </span>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {viewing.description}
                </p>
                <p className="font-semibold text-burgundy">
                  {formatBDT(viewing.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {viewing.status === "approved" && viewing.isAvailable
                    ? "This service is live and visible to customers."
                    : "This service is currently hidden from customers."}
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject confirm */}
      <ConfirmDialog
        open={Boolean(rejecting)}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={`Reject "${rejecting?.serviceName}"?`}
        description="The vendor will keep the service in their dashboard with a Rejected status, but it will be hidden from customers. Inappropriate services can be deleted instead."
        confirmLabel="Reject Service"
        destructive
        onConfirm={() => void handleRejectConfirm()}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete "${deleting?.serviceName}"?`}
        description="The service and its booking requests will be permanently removed from the platform. This cannot be undone."
        confirmLabel="Delete Permanently"
        destructive
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}
