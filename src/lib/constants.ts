export const APP_NAME = "WedPlan";
export const APP_TAGLINE = "Your dream wedding, beautifully planned.";
export const APP_DESCRIPTION =
  "WedPlan is a wedding planning platform where couples discover trusted wedding professionals, explore beautiful venues, and request bookings — all in one place.";

/** Password shared by the seeded demo accounts (documented in the README). */
export const DEMO_PASSWORD = "Demo@123";

export function dashboardHomeForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "vendor":
      return "/dashboard/vendor";
    case "customer":
      return "/dashboard/customer";
    default:
      return "/dashboard";
  }
}

export const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  succeeded: "Succeeded",
  processing: "Processing",
  failed: "Failed",
  refunded: "Refunded",
};
