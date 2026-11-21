"use client";

/**
 * Typed API client for the Express backend in ../wedplan-server.
 *
 * That server authenticates with a JWT from Better Auth, not with the
 * httpOnly session cookie. getClientToken() reads the short-lived JWT and we
 * send it as `Authorization: Bearer <token>`. Requests still include
 * credentials so the Next.js /api/upload route (ImgBB) keeps working.
 */

import { getClientToken } from "@/lib/getClientToken";
import type { Booking, Service, Transaction, User } from "@/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

/** Routes handled by this Next.js app rather than by the Express server. */
const LOCAL_PATHS = ["/api/upload"];

/**
 * Public Express routes need no JWT. Skipping the token lookup here avoids
 * needless auth requests (and noisy errors) for guests browsing the site.
 */
const PUBLIC_PATHS = [
  "/api/services",
  "/api/vendors",
  "/api/subscription/plans",
];

function matches(path: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(`${prefix}/`) ||
      path.startsWith(`${prefix}?`),
  );
}

function isLocal(path: string): boolean {
  return matches(path, LOCAL_PATHS);
}

function isPublic(path: string): boolean {
  return matches(path, PUBLIC_PATHS);
}

function fullUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return isLocal(path) ? path : `${API_BASE}${path}`;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);

  if (init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!isLocal(path) && !isPublic(path)) {
    const authorization = await getClientToken();
    if (authorization) headers.set("Authorization", authorization);
  }

  const res = await fetch(fullUrl(path), {
    ...init,
    headers,
    credentials: "include",
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response
  }

  if (!res.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : "Request failed. Please try again.";
    throw new ApiError(res.status, message);
  }

  return data as T;
}

function qs(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "")
      search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------- Types

export type ServiceWithVendor = Service & { vendor?: User };
export type BookingWithDetails = Booking & {
  service?: Service;
  vendor?: User;
  customer?: User;
};
export type TransactionWithVendor = Transaction & { vendor?: User };
export type AdminUser = User & {
  serviceCount: number;
  bookingCount: number;
  requestCount: number;
};

export interface SubscriptionStatus {
  success: boolean;
  activated: boolean;
  plan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  transaction: TransactionWithVendor;
}

// ---------------------------------------------------------------- Client

export const api = {
  // public services
  services: (
    filters: {
      q?: string;
      category?: string;
      location?: string;
      sort?: string;
      limit?: number;
    } = {},
  ) =>
    request<{
      services: ServiceWithVendor[];
      total: number;
      locations: string[];
    }>(`/api/services${qs(filters)}`),
  service: (id: string) =>
    request<{ service: ServiceWithVendor }>(`/api/services/${id}`),
  vendors: () =>
    request<{ vendors: (User & { activeServiceCount: number })[] }>(
      "/api/vendors",
    ),

  // vendor
  vendorServices: () =>
    request<{ services: Service[] }>("/api/vendor/services"),
  vendorStats: () =>
    request<{
      totalServices: number;
      activeServices: number;
      pendingBookings: number;
      acceptedBookings: number;
      currentPlan: "free" | "premium";
      planExpiresAt: string | null;
    }>("/api/vendor/stats"),
  createService: (input: Record<string, unknown>) =>
    request<{ service: Service }>("/api/vendor/services", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateService: (id: string, input: Record<string, unknown>) =>
    request<{ service: Service }>(`/api/vendor/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteService: (id: string) =>
    request<{ success: true; message: string }>(`/api/vendor/services/${id}`, {
      method: "DELETE",
    }),
  setServiceAvailability: (id: string, isAvailable: boolean) =>
    request<{ service: Service }>(`/api/vendor/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),
  vendorTransactions: () =>
    request<{ transactions: TransactionWithVendor[] }>(
      "/api/vendor/transactions",
    ),
  vendorBookings: () =>
    request<{ bookings: BookingWithDetails[]; total: number }>(
      "/api/vendor/bookings",
    ),

  // bookings
  bookings: () => request<{ bookings: BookingWithDetails[] }>("/api/bookings"),
  createBooking: (input: {
    serviceId: string;
    eventDate: string;
    eventLocation: string;
    message: string;
  }) =>
    request<{ booking: Booking }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  cancelBooking: (id: string) =>
    request<{ booking: Booking }>(`/api/bookings/${id}/cancel`, {
      method: "PATCH",
    }),
  respondToBooking: (id: string, status: "accepted" | "rejected") =>
    request<{ booking: Booking }>(`/api/bookings/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // customer
  customerStats: () =>
    request<{
      totalBookings: number;
      pending: number;
      accepted: number;
      rejected: number;
    }>("/api/customer/stats"),

  // admin
  adminStats: () =>
    request<{
      totalUsers: number;
      totalVendors: number;
      totalCustomers: number;
      totalServices: number;
      pendingServices: number;
      totalTransactions: number;
      totalRevenue: number;
    }>("/api/admin/stats"),
  adminUsers: (filters: { q?: string; role?: string } = {}) =>
    request<{ users: AdminUser[] }>(`/api/admin/users${qs(filters)}`),
  adminSetUserBlocked: (id: string, isBlocked: boolean) =>
    request<{ user: User }>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    }),
  adminServices: (
    filters: { q?: string; status?: string; category?: string } = {},
  ) =>
    request<{ services: ServiceWithVendor[] }>(
      `/api/admin/services${qs(filters)}`,
    ),
  adminSetServiceStatus: (id: string, status: "approved" | "rejected") =>
    request<{ service: Service }>(`/api/admin/services/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminSetServiceAvailability: (id: string, isAvailable: boolean) =>
    request<{ service: Service }>(`/api/admin/services/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),
  adminDeleteService: (id: string) =>
    request<{ success: true; message: string }>(`/api/admin/services/${id}`, {
      method: "DELETE",
    }),
  adminBookings: () =>
    request<{ bookings: BookingWithDetails[]; total: number }>(
      "/api/admin/bookings",
    ),
  adminTransactions: () =>
    request<{ transactions: TransactionWithVendor[] }>(
      "/api/admin/transactions",
    ),

  // subscription / payment
  createCheckout: () =>
    request<{ sessionId: string; url: string; transactionId: string }>(
      "/api/subscription/checkout",
      {
        method: "POST",
      },
    ),
  subscriptionStatus: (sessionId: string) =>
    request<SubscriptionStatus>(
      `/api/subscription/status${qs({ session_id: sessionId })}`,
    ),

  // profile
  updateProfile: (input: Record<string, unknown>) =>
    request<{ user: User }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  // upload (handled by this Next.js app, not the Express server)
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string; hosted: string }>("/api/upload", {
      method: "POST",
      body: form,
    });
  },
};
