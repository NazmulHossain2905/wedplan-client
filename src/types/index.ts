export type Role = "customer" | "vendor" | "admin";
export type SubscriptionPlan = "free" | "premium";
export type ServiceStatus = "pending" | "approved" | "rejected";
export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type PaymentStatus = "succeeded" | "processing" | "failed" | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: Role;
  isBlocked: boolean;
  /** Vendor only */
  businessName?: string;
  /** Vendor only — short tagline shown on cards */
  specialty?: string;
  location?: string;
  phone?: string;
  bio?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string;
  joinedAt: string;
  /** Vendor only */
  rating?: number;
  completedWeddings?: number;
}

/** Shape used only by the seed script (passwords are hashed at rest). */
export type SeedUser = User & { password: string };

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Service {
  id: string;
  vendorId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: ServiceStatus;
  isAvailable: boolean;
  createdAt: string;
  featured?: boolean;
  rating: number;
  reviews: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  vendorId: string;
  plan: "premium";
  amount: number;
  currency: "BDT";
  stripeSessionId: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface DemoSnapshot {
  users: User[];
  services: Service[];
  bookings: Booking[];
  transactions: Transaction[];
  currentUserId: string | null;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface BookingInput {
  serviceId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
}

export interface ServiceInput {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  isAvailable: boolean;
}

export interface ProfileInput {
  name: string;
  image: string;
  businessName?: string;
  location?: string;
  phone?: string;
  bio?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  partner: string;
  location: string;
  weddingDate: string;
  rating: number;
  text: string;
  avatar: string;
  serviceName: string;
}

export type SortOption = "recommended" | "price-asc" | "price-desc";
