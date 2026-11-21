import { env } from "@/lib/env";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(env.MONGODB_URI, {
  // Same serverless-friendly limits as wedplan-server: a small pool per
  // instance keeps us under the Atlas connection limit, and fail fast rather
  // than hanging 30 seconds (which leaves a dead topology behind).
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 3000,
});
const db = client.db(env.DB_NAME);

/**
 * A warmed serverless instance can reuse the module-level client after its
 * topology was closed (that is exactly what produces
 * `MongoTopologyClosedError` in /dashboard routes). Calling connect() again
 * reopens it. The driver treats this as a no-op when already connected.
 */
export async function ensureAuthConnection() {
  await client.connect();
}

/** Google sign-in is only registered when both credentials are configured. */
const googleProvider =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {};

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      /** App role. Chosen at sign-up and used for routing and authorization. */
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      /** Set by admins to suspend an account. */
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      /** Vendor shop name shown on cards and the public profile. */
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      /** Vendor tagline shown on cards. */
      specialty: {
        type: "string",
        required: false,
        input: true,
      },
      location: {
        type: "string",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      /** Billing plan. Managed server-side, never by the client. */
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
      joinedAt: {
        type: "date",
        required: false,
        defaultValue: () => new Date(),
        input: false,
      },
      /** Derived from reviews, maintained by the backend. */
      rating: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      completedWeddings: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
    },
  },

  socialProviders: {
    ...googleProvider,
  },

  /**
   * The sign-up form may ask for "vendor", but nobody may sign themselves up
   * as an admin. The Express backend trusts the role stored by Better Auth,
   * so sanitize it here, before the user document is ever written.
   * Admin accounts are created by listing their email in ADMIN_EMAILS.
   */
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedAdminEmails = env.ADMIN_EMAILS.split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

          const isBootstrapAdmin = allowedAdminEmails.includes(
            String(user.email ?? "").toLowerCase(),
          );

          const role = isBootstrapAdmin
            ? "admin"
            : user.role === "vendor"
              ? "vendor"
              : "customer";

          return {
            data: {
              ...user,
              role,
              isBlocked: false,
              subscriptionPlan: "free",
            },
          };
        },
      },
    },
  },

  /**
   * Issues short-lived JWTs (GET /api/auth/token) and publishes the public
   * keys (GET /api/auth/jwks) so the Express backend can verify them.
   */
  plugins: [jwt()],

  database: mongodbAdapter(db, { client }),
});
