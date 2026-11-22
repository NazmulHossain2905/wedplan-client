import { auth, ensureAuthConnection } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

/**
 * Reconnect the shared Mongo client before each auth request so a warmed
 * serverless instance never serves a request with a closed topology.
 */
export async function GET(request: Request) {
  await ensureAuthConnection();
  return handler.GET(request);
}

export async function POST(request: Request) {
  await ensureAuthConnection();
  return handler.POST(request);
}
