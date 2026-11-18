import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ROLE_LABELS,
  SERVICE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  BookingStatus,
  PaymentStatus,
  Role,
  ServiceStatus,
} from "@/types";
import { BadgeCheck, Crown, ShieldCheck, XCircle } from "lucide-react";
import * as React from "react";

function Base({
  className,
  children,
  title,
}: {
  className: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const styles: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-700",
  };
  return (
    <Base
      className={cn(styles[status], className)}
      title={`Booking status: ${BOOKING_STATUS_LABELS[status]}`}
    >
      <span aria-hidden>●</span>
      {BOOKING_STATUS_LABELS[status]}
    </Base>
  );
}

export function ServiceStatusBadge({
  status,
  className,
}: {
  status: ServiceStatus;
  className?: string;
}) {
  const styles: Record<ServiceStatus, { cls: string; icon: React.ReactNode }> =
    {
      pending: {
        cls: "bg-amber-100 text-amber-800",
        icon: <span aria-hidden>◔</span>,
      },
      approved: {
        cls: "bg-emerald-100 text-emerald-800",
        icon: <BadgeCheck aria-hidden className="size-3" />,
      },
      rejected: {
        cls: "bg-red-100 text-red-800",
        icon: <XCircle aria-hidden className="size-3" />,
      },
    };
  const s = styles[status];
  return (
    <Base
      className={cn(s.cls, className)}
      title={`Approval status: ${SERVICE_STATUS_LABELS[status]}`}
    >
      {s.icon}
      {SERVICE_STATUS_LABELS[status]}
    </Base>
  );
}

export function AvailabilityBadge({
  available,
  className,
}: {
  available: boolean;
  className?: string;
}) {
  return (
    <Base
      className={
        available
          ? "bg-sage-tint text-[#4d5c44] " + (className ?? "")
          : "bg-gray-200 text-gray-700 " + (className ?? "")
      }
      title={
        available
          ? "Service is active and publicly visible"
          : "Service is inactive and hidden from customers"
      }
    >
      {available ? "Active" : "Inactive"}
    </Base>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const styles: Record<PaymentStatus, string> = {
    succeeded: "bg-emerald-100 text-emerald-800",
    processing: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-sky-100 text-sky-800",
  };
  return (
    <Base
      className={cn(styles[status], className)}
      title={`Payment status: ${PAYMENT_STATUS_LABELS[status]}`}
    >
      <span aria-hidden>●</span>
      {PAYMENT_STATUS_LABELS[status]}
    </Base>
  );
}

export function RoleBadge({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const styles: Record<Role, string> = {
    admin: "bg-[#3d2f52] text-white",
    vendor: "bg-rose-tint text-burgundy",
    customer: "bg-sage-tint text-[#4d5c44]",
  };
  return (
    <Base
      className={cn(styles[role], className)}
      title={`Role: ${ROLE_LABELS[role]}`}
    >
      {role === "admin" ? <ShieldCheck aria-hidden className="size-3" /> : null}
      {ROLE_LABELS[role]}
    </Base>
  );
}

export function UserStatusBadge({
  blocked,
  className,
}: {
  blocked: boolean;
  className?: string;
}) {
  return (
    <Base
      className={
        blocked
          ? "bg-red-100 text-red-800 " + (className ?? "")
          : "bg-emerald-100 text-emerald-800 " + (className ?? "")
      }
      title={blocked ? "This account is blocked" : "This account is active"}
    >
      {blocked ? "Blocked" : "Active"}
    </Base>
  );
}

export function PremiumBadge({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      title="Premium vendor"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#8a6d2f] via-[#c9a227] to-[#8a6d2f] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm",
        className,
      )}
    >
      <Crown aria-hidden className="size-3" />
      {!compact && "Premium"}
    </span>
  );
}
