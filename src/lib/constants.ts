export const APP_NAME = "WedPlan";
export const APP_TAGLINE = "Your dream wedding, beautifully planned.";
export const APP_DESCRIPTION =
  "WedPlan is a wedding planning platform where couples discover trusted wedding professionals, explore beautiful venues, and request bookings — all in one place.";

export const CONTACT_INFO = {
  email: "hello@wedplan.com",
  phone: "+880 1700-000000",
  address: "House 12, Road 5, Gulshan 1, Dhaka 1212, Bangladesh",
} as const;

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

export const FREE_PLAN = {
  name: "Free",
  price: 0,
  currency: "৳ BDT",
  maxActiveServices: 3,
  features: [
    "Up to 3 pending or approved services",
    "Basic vendor dashboard",
    "Booking request management",
    "Public vendor profile",
  ],
} as const;

export const PREMIUM_PLAN = {
  name: "Premium",
  price: 4999,
  currency: "৳ BDT",
  maxActiveServices: Infinity,
  features: [
    "Unlimited Services",
    "Premium Vendor Badge",
    "All Free Plan Features",
  ],
} as const;

export const PREMIUM_PRICE_BDT = 4999;

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
