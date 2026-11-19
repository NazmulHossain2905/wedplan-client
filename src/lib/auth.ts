import { env } from "@/lib/env";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";

const client = new MongoClient(env.MONGODB_URI);
const db = client.db(env.DB_NAME);

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

  database: mongodbAdapter(db, { client }),
});
