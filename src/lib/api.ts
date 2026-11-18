"use client";

/**
 * Typed API client. Every request sends the httpOnly session cookie
 * (credentials: "include") so protected routes authenticate server-side.
 */

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
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
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

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

// ── Types shared with the API ──────────────────────────────────────────────
import type { Booking, Service, Transaction, User } from "@/types";

export type ServiceWithVendor = Service & { vendor?: User };
export type BookingWithDetails = Booking & { service?: Service; vendor?: User; customer?: User };
export type TransactionWithVendor = Transaction & { vendor?: User };

export interface AuthConfig {
  googleEnabled: boolean;
  stripeEnabled: boolean;
  imgbbEnabled: boolean;
}

export const api = {
  // auth
  config: () => request<AuthConfig>("/api/auth/config"),
  session: () => request<{ user: User | null }>("/api/auth/session"),
  signIn: (email: string, password: string, remember = true) =>
    request<{ user: User }>("/api/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    }),
  signUp: (input: Record<string, unknown>) =>
    request<{ user: User }>("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  signOut: () => request<{ ok: true }>("/api/auth/sign-out", { method: "POST" }),
  googleDemo: () => request<{ user: User }>("/api/auth/google-demo", { method: "POST" }),

  // public services
  services: (filters: { q?: string; category?: string; location?: string; sort?: string; featured?: boolean; limit?: number } = {}) =>
    request<{ services: ServiceWithVendor[]; total: number; locations: string[] }>(`/api/services${qs(filters)}`),
  service: (id: string) => request<{ service: ServiceWithVendor }>(`/api/services/${id}`),
  vendors: () => request<{ vendors: (User & { activeServiceCount: number })[] }>("/api/vendors"),

  // vendor
  vendorServices: () => request<{ services: Service[] }>("/api/vendor/services"),
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
  deleteService: (id: string) => request<{ ok: true }>(`/api/vendor/services/${id}`, { method: "DELETE" }),
  setServiceAvailability: (id: string, isAvailable: boolean) =>
    request<{ service: Service }>(`/api/vendor/services/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),
  vendorTransactions: () => request<{ transactions: Transaction[] }>("/api/vendor/transactions"),

  // bookings
  bookings: () => request<{ bookings: BookingWithDetails[] }>("/api/bookings"),
  createBooking: (input: { serviceId: string; eventDate: string; eventLocation: string; message: string }) =>
    request<{ booking: Booking }>("/api/bookings", { method: "POST", body: JSON.stringify(input) }),
  cancelBooking: (id: string) => request<{ booking: Booking }>(`/api/bookings/${id}/cancel`, { method: "PATCH" }),
  respondToBooking: (id: string, status: "accepted" | "rejected") =>
    request<{ booking: Booking }>(`/api/bookings/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // customer
  customerStats: () =>
    request<{ totalBookings: number; pending: number; accepted: number; rejected: number }>(
      "/api/customer/stats",
    ),

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
    request<{ users: (User & { serviceCount: number; bookingCount: number; requestCount: number })[] }>(
      `/api/admin/users${qs(filters)}`,
    ),
  adminSetUserBlocked: (id: string, isBlocked: boolean) =>
    request<{ user: User }>(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isBlocked }),
    }),
  adminServices: (filters: { q?: string; status?: string; category?: string } = {}) =>
    request<{ services: ServiceWithVendor[] }>(`/api/admin/services${qs(filters)}`),
  adminSetServiceStatus: (id: string, status: "pending" | "approved" | "rejected") =>
    request<{ service: Service }>(`/api/admin/services/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  adminSetServiceAvailability: (id: string, isAvailable: boolean) =>
    request<{ service: Service }>(`/api/admin/services/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    }),
  adminDeleteService: (id: string) => request<{ ok: true }>(`/api/admin/services/${id}`, { method: "DELETE" }),
  adminTransactions: () => request<{ transactions: TransactionWithVendor[] }>("/api/admin/transactions"),

  // subscription / payment
  createCheckout: () =>
    request<{ sessionId: string; url: string; simulated: boolean }>("/api/subscription/checkout", {
      method: "POST",
    }),
  checkoutInfo: (sessionId: string) =>
    request<{
      sessionId: string;
      plan: string;
      amount: number;
      currency: string;
      vendorName: string;
      status: string;
    }>(`/api/payment/checkout-info${qs({ session_id: sessionId })}`),
  simulatePayment: (sessionId: string) =>
    request<{ ok: true }>("/api/payment/simulate", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
  cancelPayment: (sessionId: string) =>
    request<{ ok: true }>("/api/payment/cancel", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
  verifyPayment: (sessionId: string) =>
    request<{ status: string; amount: number; currency: string; plan: string; activated: boolean }>(
      `/api/payment/verify${qs({ session_id: sessionId })}`,
    ),

  // profile
  updateProfile: (input: Record<string, unknown>) =>
    request<{ user: User }>("/api/profile", { method: "PATCH", body: JSON.stringify(input) }),

  // upload
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string; hosted: string }>("/api/upload", { method: "POST", body: form });
  },
};
