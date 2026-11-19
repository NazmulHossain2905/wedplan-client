"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ServiceForm } from "@/components/forms/service-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@/types";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!service || !owns) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<SearchX aria-hidden />}
          title="Service not found"
          description="This service doesn't exist, or it belongs to another vendor. You can only edit your own listings."
          action={{ label: "Back to My Services", href: "/dashboard/vendor/services" }}
          className="mx-auto max-w-xl"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
          <Link href="/dashboard/vendor/services">
            <ArrowLeft aria-hidden className="size-4" /> Back to My Services
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Edit Service
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update the details of &ldquo;{service.serviceName}&rdquo;. The approval status stays
            unchanged.
          </p>
        </div>
      </div>

      <ServiceForm key={service.id} mode="edit" service={service} />
    </div>
  );
}
