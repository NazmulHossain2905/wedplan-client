/**
 * Centralized environment configuration.
 *
 * Read configuration through `env` instead of `process.env` so that every
 * variable is documented in one place and missing values fail loudly.
 *
 * Values are resolved lazily. Importing this module from a client component
 * never touches server-only secrets (Next.js strips them from client
 * bundles), but reading one still throws a clear error.
 *
 * Server-only: MONGODB_URI, DB_NAME, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
 * GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, IMGBB_API_KEY.
 * Client-safe: NEXT_PUBLIC_API_URL (inlined at build time).
 */

const isBrowser = typeof window !== "undefined";

function required(name: string, value: string | undefined): string {
  const resolved = value?.trim();
  if (!resolved) {
    throw new Error(
      `Missing required environment variable "${name}". Add it to your .env file (see .env.example).`,
    );
  }
  return resolved;
}

function optional(
  name: string,
  value: string | undefined,
  fallback: string,
): string {
  return value?.trim() || fallback;
}

function parsePort(
  name: string,
  value: string | undefined,
  fallback: number,
): number {
  const raw = value?.trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(
      `Environment variable "${name}" must be a valid port number, received "${raw}".`,
    );
  }
  return parsed;
}

/** Reads a variable that must never reach the browser. */
function serverValue(name: string, value: string | undefined): string;
function serverValue(
  name: string,
  value: string | undefined,
  fallback: string,
): string;
function serverValue(
  name: string,
  value: string | undefined,
  fallback?: string,
): string {
  if (isBrowser) {
    throw new Error(
      `env.${name} is server-only and cannot be read from client code.`,
    );
  }
  return fallback === undefined
    ? required(name, value)
    : optional(name, value, fallback);
}

export const env = {
  /** Runtime the app is running in. */
  get NODE_ENV() {
    return (process.env.NODE_ENV ?? "development") as
      | "development"
      | "test"
      | "production";
  },

  /** Port used by `next dev` / `next start`. */
  get PORT() {
    return parsePort("PORT", process.env.PORT, 3000);
  },

  /** Public URL of this app. Used by better-auth to build callbacks. */
  get BETTER_AUTH_URL() {
    return serverValue(
      "BETTER_AUTH_URL",
      process.env.BETTER_AUTH_URL,
      `http://localhost:${env.PORT}`,
    );
  },

  /** Secret used by better-auth to sign sessions and tokens. */
  get BETTER_AUTH_SECRET() {
    return serverValue("BETTER_AUTH_SECRET", process.env.BETTER_AUTH_SECRET);
  },

  /** MongoDB connection string. */
  get MONGODB_URI() {
    return serverValue("MONGODB_URI", process.env.MONGODB_URI);
  },

  /** MongoDB database that stores users, sessions and accounts. */
  get DB_NAME() {
    return serverValue("DB_NAME", process.env.DB_NAME);
  },

  /**
   * Comma-separated emails that may be created with the admin role.
   * Empty by default: sign-ups can only become customers or vendors.
   */
  get ADMIN_EMAILS() {
    return serverValue("ADMIN_EMAILS", process.env.ADMIN_EMAILS, "");
  },

  /** Google OAuth client id. Empty when Google sign-in is not configured. */
  get GOOGLE_CLIENT_ID() {
    return serverValue("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID, "");
  },

  /** Google OAuth client secret. Empty when Google sign-in is not configured. */
  get GOOGLE_CLIENT_SECRET() {
    return serverValue(
      "GOOGLE_CLIENT_SECRET",
      process.env.GOOGLE_CLIENT_SECRET,
      "",
    );
  },

  /**
   * ImgBB API key used to host profile/service images. Empty when image
   * hosting is not configured — uploads then return a clear error.
   */
  get IMGBB_API_KEY() {
    return serverValue("IMGBB_API_KEY", process.env.IMGBB_API_KEY, "");
  },

  /** Base URL of the WedPlan backend API. Safe to use in the browser. */
  get NEXT_PUBLIC_API_URL() {
    return required("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
  },
} as const;
