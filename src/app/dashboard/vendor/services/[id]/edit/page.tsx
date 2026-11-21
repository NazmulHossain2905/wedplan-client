"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Images,
  PenLine,
  SearchX,
  Send,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServiceForm } from "@/components/forms/service-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@/types";

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return (
    <DashboardPage role="vendor">
      <EditService id={id} />
    </DashboardPage>
  );
}

function EditService({ id }: { id: string }) {
  const { user } = useAuth();

  const [myServices, setMyServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.role !== "vendor") return;

    let cancelled = false;

    async function loadServices() {
      try {
        const res = await api.vendorServices();
        if (!cancelled) setMyServices(res.services);
      } catch {
        // Leave the not-found state to handle it.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const service = myServices.find((s) => s.id === id);
  // Vendors may only edit their own services — anything else is treated as not found.
  const owns = Boolean(service && user && service.vendorId === user.id);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[36rem] w-full rounded-2xl" />
      </div>
    );
  }

  if (!service || !owns) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-rose-tint via-card to-card p-6 shadow-xs sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-rose-soft/50 blur-3xl"
            aria-hidden
          />
          <div className="relative space-y-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 w-fit gap-1.5 text-muted-foreground"
            >
              <Link href="/dashboard/vendor/services">
                <ArrowLeft aria-hidden className="size-4" /> Back to My Services
              </Link>
            </Button>
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy/75">
                Vendor studio
              </p>
              <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                Edit Service
              </h1>
            </div>
          </div>
        </div>
        <EmptyState
          icon={<SearchX aria-hidden />}
          title="Service not found"
          description="This service doesn't exist, or it belongs to another vendor. You can only edit your own listings."
          action={{
            label: "Back to My Services",
            href: "/dashboard/vendor/services",
          }}
          className="mx-auto max-w-xl"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-rose-tint via-card to-card p-6 shadow-xs sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-rose-soft/50 blur-3xl"
          aria-hidden
        />
        <div className="relative space-y-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit gap-1.5 text-muted-foreground"
          >
            <Link href="/dashboard/vendor/services">
              <ArrowLeft aria-hidden className="size-4" /> Back to My Services
            </Link>
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-burgundy/75">
                Vendor studio
              </p>
              <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                Edit Service
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                Update the details of &ldquo;{service.serviceName}&rdquo;. The
                approval status stays unchanged.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/85 px-3 py-1.5 text-xs font-medium capitalize text-muted-foreground shadow-xs backdrop-blur-sm">
              <Sparkles aria-hidden className="size-3.5 text-[#c9a227]" />
              {service.status} · {service.isAvailable ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: PenLine,
            title: "Basic details",
            description: "Name, category, price and location",
          },
          {
            icon: Images,
            title: "Add photos",
            description: "Up to 6 images — the first is the cover",
          },
          {
            icon: Send,
            title: "Save your changes",
            description: "Approval status stays exactly as it is",
          },
        ].map((step, i) => (
          <div
            key={step.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xs"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-tint text-burgundy">
              <step.icon aria-hidden className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="text-xs text-muted-foreground">0{i + 1}</span>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <section className="rounded-2xl border border-border bg-card/70 p-5 shadow-xs sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">
              Service details
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fill in the details below — you can edit them any time.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            * Required fields
          </span>
        </div>
        <ServiceForm key={service.id} mode="edit" service={service} />
      </section>
    </div>
  );
}
