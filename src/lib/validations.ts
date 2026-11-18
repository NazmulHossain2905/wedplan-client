export interface PasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  get valid(): boolean;
}

export function validatePassword(password: string): PasswordChecks {
  const minLength = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  return {
    minLength,
    hasUpper,
    hasLower,
    get valid() {
      return minLength && hasUpper && hasLower;
    },
  };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateSignUp(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  businessName?: string;
}): string | null {
  if (!input.name.trim() || input.name.trim().length < 2) {
    return "Please enter your full name (at least 2 characters).";
  }
  if (!isValidEmail(input.email)) {
    return "Please enter a valid email address.";
  }
  if (!validatePassword(input.password).valid) {
    return "Password must be at least 6 characters and contain one uppercase and one lowercase letter.";
  }
  if (input.role !== "customer" && input.role !== "vendor") {
    return "Please choose an account role.";
  }
  if (input.role === "vendor" && (!input.businessName || input.businessName.trim().length < 2)) {
    return "Please enter your business name.";
  }
  return null;
}

export function validateService(input: {
  serviceName: string;
  category: string;
  description: string;
  price: string | number;
  location: string;
  images: string[];
}): string | null {
  if (!input.serviceName.trim() || input.serviceName.trim().length < 3) {
    return "Service name must be at least 3 characters.";
  }
  if (!input.category) {
    return "Please select a service category.";
  }
  if (!input.description.trim() || input.description.trim().length < 20) {
    return "Description must be at least 20 characters.";
  }
  const price = typeof input.price === "string" ? Number(input.price) : input.price;
  if (!Number.isFinite(price) || price <= 0) {
    return "Please enter a valid price greater than 0.";
  }
  if (!input.location.trim()) {
    return "Please enter the service location.";
  }
  if (input.images.length === 0) {
    return "Please add at least one service image.";
  }
  return null;
}

export function validateBooking(input: {
  eventDate: string;
  eventLocation: string;
}): string | null {
  if (!input.eventDate) {
    return "Please choose your event date.";
  }
  if (input.eventDate < new Date().toISOString().slice(0, 10)) {
    return "Event date cannot be in the past.";
  }
  if (!input.eventLocation.trim()) {
    return "Please enter the event location.";
  }
  return null;
}
