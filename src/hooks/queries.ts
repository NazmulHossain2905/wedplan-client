"use client";

import { api } from "@/lib/api";
import type { User } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * React Query hooks — server state for every page. Protected endpoints are
 * guarded server-side; queries are only enabled when the session user has
 * the matching role.
 */

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const { user } = await api.session();
        return user;
      } catch {
        return null;
      }
    },
    staleTime: 30 * 1000,
  });
}

export function useAuthConfig() {
  return useQuery({
    queryKey: ["auth-config"],
    queryFn: () => api.config(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicServices(
  filters: {
    q?: string;
    category?: string;
    location?: string;
    sort?: string;
    featured?: boolean;
    limit?: number;
  } = {},
) {
  return useQuery({
    queryKey: ["services", filters],
    queryFn: () => api.services(filters),
    staleTime: 15 * 1000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => api.service(id),
    staleTime: 10 * 1000,
    retry: false,
  });
}

export function useVendorServices(user: User | null) {
  return useQuery({
    queryKey: ["vendor-services"],
    queryFn: () => api.vendorServices(),
    enabled: user?.role === "vendor",
  });
}

export function useVendorStats(user: User | null) {
  return useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => api.vendorStats(),
    enabled: user?.role === "vendor",
  });
}

export function useVendorTransactions(user: User | null) {
  return useQuery({
    queryKey: ["vendor-transactions"],
    queryFn: () => api.vendorTransactions(),
    enabled: user?.role === "vendor",
  });
}

export function useBookings(user: User | null) {
  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => api.bookings(),
    enabled: Boolean(user),
  });
}

export function useCustomerStats(user: User | null) {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: () => api.customerStats(),
    enabled: user?.role === "customer",
  });
}

export function useAdminStats(user: User | null) {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.adminStats(),
    enabled: user?.role === "admin",
  });
}

export function useAdminUsers(
  user: User | null,
  filters: { q?: string; role?: string } = {},
) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => api.adminUsers(filters),
    enabled: user?.role === "admin",
  });
}

export function useAdminServices(
  user: User | null,
  filters: { q?: string; status?: string; category?: string } = {},
) {
  return useQuery({
    queryKey: ["admin-services", filters],
    queryFn: () => api.adminServices(filters),
    enabled: user?.role === "admin",
  });
}

export function useAdminTransactions(user: User | null) {
  return useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => api.adminTransactions(),
    enabled: user?.role === "admin",
  });
}

export function usePaymentVerify(
  user: User | null,
  sessionId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ["payment-verify", sessionId],
    queryFn: () => api.verifyPayment(sessionId),
    enabled: Boolean(user) && Boolean(sessionId) && enabled,
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 1500 : false,
  });
}

/** Invalidate everything role/data-related after a mutation or role change. */
export function useInvalidateData() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries();
  };
}
