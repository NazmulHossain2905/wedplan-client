# WedPlan — Wedding Planning Platform (Client)

## Project Overview

WedPlan is a role-based wedding planning marketplace. Customers discover wedding services and send booking requests; vendors publish and manage services, handle bookings and upgrade to Premium; admins review services, manage users and monitor transactions. This repository contains the Next.js 16 frontend. Authentication and session data live here (Better Auth); business data lives in the companion `wedplan-server` Express API.

## Features

- Public home page, service catalogue with search/filter/sort, and private service details
- Better Auth email/password and Google sign-in, with short-lived JWTs for the Express API
- Proxy-based route protection: session, blocked-account and role checks run before pages render
- Vendor service management with admin approval; Free plan allows 3 pending or approved services (Premium unlimited)
- Booking requests with accept/reject/cancel and ownership checks
- Stripe Checkout upgrade flow with a read-only payment status page
- Profile settings with ImgBB image hosting
- Optimized remote images via `next/image` with lazy loading and responsive sizes
- Responsive wedding-themed UI built with ShadCN, Tailwind 4, Recharts and Motion

## Tech Stack

Next.js 16 (App Router, TypeScript), React 19, Better Auth 1.7 with MongoDB adapter, Tailwind CSS 4, ShadCN, Recharts, Framer Motion, sonner, lucide-react. Server-side image optimization is handled by `next/image`.

## Getting Started

Prerequisites:

- Node.js 20+ and npm
- A MongoDB database shared with the server
- The companion `wedplan-server` API running locally (port 5000 by default)

Clone the repo, install dependencies, create `.env` from `.env.example`, fill in the secrets, then run `npm run dev`. The app is available at `http://localhost:3000`.

Sign up as a customer or vendor, or create an admin by adding your email to `ADMIN_EMAILS` before signing up.

## Installation

```bash
git clone https://github.com/NazmulHossain2905/wedplan-client.git
cd wedplan-client
npm install
cp .env.example .env   # Windows: Copy-Item .env.example .env
```

Fill in `.env` (see below). Secrets (Better Auth secret, MongoDB URI, Google OAuth, ImgBB key) stay local and are never committed.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Port used by `next dev` / `next start` (default `3000`) |
| `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Better Auth configuration and JWT signing |
| `MONGODB_URI`, `DB_NAME` | Database shared with the server |
| `NEXT_PUBLIC_API_URL` | Express API base URL, e.g. `http://localhost:5000` |
| `ADMIN_EMAILS` | Comma-separated emails allowed to register as admin; leave empty otherwise |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `IMGBB_API_KEY` | Image hosting (server-only) |

**Creating an admin:** add the email to `ADMIN_EMAILS`, restart Next.js, then sign up normally with that email. Public sign-ups can only become customers or vendors.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on `http://localhost:3000` |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint over the codebase |

## Project Structure

```
src/
├── app/
│   ├── (site)/                 # Public pages: home, services catalogue, sign-in, sign-up
│   ├── dashboard/              # Role dashboards (admin, customer, vendor) and profile
│   ├── payment/                # Checkout, success and cancel pages
│   ├── api/
│   │   ├── auth/[...all]/      # Better Auth handler (GET/POST)
│   │   └── upload/             # ImgBB upload proxy (server-side API key)
│   ├── layout.tsx              # Root layout with providers and global CSS
│   ├── globals.css
│   └── icon.png                # App icon (Next.js metadata convention)
├── components/
│   ├── dashboard/              # Dashboard shell and loading boundary
│   ├── forms/                  # Auth, service and profile forms
│   ├── home/                   # Landing-page sections
│   ├── layout/                 # Navbar, footer, theme toggle, user menu
│   ├── payment/                # Checkout/payment result views
│   ├── services/               # Service cards, gallery, browser, booking dialog
│   ├── shared/                 # Badges, safe image, empty states, etc.
│   └── ui/                     # ShadCN UI primitives
├── contexts/auth-context.tsx   # Client session state backed by Better Auth
├── data/                       # Static categories and testimonials
├── lib/                        # API client, auth config, helpers, validation, constants
├── types/                      # Shared TypeScript types
└── proxy.ts                    # Route protection (Next.js proxy convention)
```

## API Integration

`src/lib/api.ts` is a typed client for the Express backend. It:

- Builds URLs from `NEXT_PUBLIC_API_URL` and sends `Authorization: Bearer <JWT>` using `getClientToken()`.
- Skips the token lookup on public paths (`/api/services`, `/api/vendors`, `/api/subscription/plans`).
- Routes `/api/upload` to this Next.js app instead of the Express server, so the ImgBB key stays server-side.
- Uses `credentials: "include"` and throws `ApiError` with the HTTP status for failed requests.

Start `wedplan-server` (`npm start`, port 5000) alongside the client; the JWT is verified by the server against this app's `/api/auth/jwks` endpoint.

## Authentication

- Better Auth handles email/password and Google sign-in; sessions are stored in cookies and the JWT plugin issues short-lived access tokens for the Express API.
- `src/proxy.ts` is the single source of truth for route access: guests are redirected from `/dashboard/**`, `/payment/**` and `/services/[id]` to `/sign-in?redirect=…`; signed-in users are redirected away from `/sign-in` and `/sign-up` to their role home; blocked accounts cannot enter protected areas; wrong-role visits are redirected to the correct dashboard.
- Role homes are `/dashboard/customer`, `/dashboard/vendor` and `/dashboard/admin`.
- `useAuth()` exposes the client session and `hydrated` flag; `BlockedUserWatcher` signs out accounts suspended by an admin.

## Live Demo

https://wedplan-bd.vercel.app/

## Related Repository

- Server (Express API): https://github.com/NazmulHossain2905/wedplan-server
- API base URL: https://wedplan-api.vercel.app/

## 📄 License

Distributed under the [MIT License](https://opensource.org/licenses/MIT). See the repository's license file for details.

---

<div align="center">
  <sub>Built with ❤️ for couples planning their big day — <em>WedPlan, where every love story begins.</em></sub>
</div>
