"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

/**
 * "View Details" behaviour: unauthenticated users are redirected to sign-in
 * (with a return path), authenticated users go straight to the service page.
 * The service route itself is protected by the proxy.
 */
export function useViewService() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  return (serviceId: string) => {
    if (hydrated && !isAuthenticated) {
      router.push(`/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
    } else {
      router.push(`/services/${serviceId}`);
    }
  };
}
