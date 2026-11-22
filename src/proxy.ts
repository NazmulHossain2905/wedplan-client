import { auth, ensureAuthConnection } from "@/lib/auth";
import { dashboardHomeForRole } from "@/lib/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type SessionUser = {
  role?: string | null;
  isBlocked?: boolean | null;
};

/** Role-scoped dashboard areas, checked before any page in them renders. */
const ROLE_SCOPES = [
  { prefix: "/dashboard/admin", role: "admin" },
  { prefix: "/dashboard/vendor", role: "vendor" },
  { prefix: "/dashboard/customer", role: "customer" },
] as const;

const AUTH_PAGES = new Set(["/sign-in", "/sign-up"]);

/** Single source of truth for where a signed-in user belongs. */
function homeFor(role?: string | null): string {
  const home = dashboardHomeForRole(role ?? "");
  // An unrecognised role has no dashboard of its own; the customer home is
  // the safe default and, unlike "/dashboard", cannot redirect to itself.
  return home === "/dashboard" ? "/dashboard/customer" : home;
}

/** Private routes need a session; the service catalogue stays public. */
function isPrivateRoute(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))
    return true;
  if (pathname === "/payment" || pathname.startsWith("/payment/")) return true;
  return /^\/services\/[^/]+\/?$/.test(pathname);
}

function toSignIn(request: NextRequest, error?: string): NextResponse {
  const url = new URL("/sign-in", request.url);
  if (error) {
    url.searchParams.set("error", error);
  } else {
    // Carry the intended destination so sign-in can return the user there.
    // The form sanitises this to same-origin paths before navigating.
    const { pathname, search } = request.nextUrl;
    url.searchParams.set("redirect", `${pathname}${search}`);
  }
  return NextResponse.redirect(url);
}

/**
 * Route access is decided here, before any page renders. Layouts and pages do
 * not repeat these checks. API handlers (and the Express backend) still verify
 * their own sessions and roles — the proxy only guards navigation.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  await ensureAuthConnection();
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user as SessionUser | undefined;

  // Blocked accounts cannot use the app. Auth pages are left alone so the
  // reason can be shown and the client watcher can sign them out — sending a
  // blocked user to sign-in from a protected route must not create a loop.
  if (user?.isBlocked) {
    return isPrivateRoute(pathname)
      ? toSignIn(request, "blocked")
      : NextResponse.next();
  }

  const isAuthPage = AUTH_PAGES.has(pathname);

  if (user) {
    const home = homeFor(user.role);

    // Signed-in users do not need the sign-in / sign-up forms.
    if (isAuthPage) return NextResponse.redirect(new URL(home, request.url));

    // Unauthenticated requests are handled below; for signed-in users the
    // dashboard root is only a router to the role-specific home.
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL(home, request.url));
    }

    // A user in the wrong role area is sent back to their own dashboard.
    const scope = ROLE_SCOPES.find(
      (s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`),
    );
    if (scope && user.role !== scope.role) {
      return NextResponse.redirect(new URL(home, request.url));
    }

    return NextResponse.next();
  }

  if (isPrivateRoute(pathname)) return toSignIn(request);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/dashboard",
    "/dashboard/:path*",
    "/payment/:path*",
    "/services/:id",
  ],
};
