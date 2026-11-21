# WedPlan — Wedding Planning Platform (Client)

WedPlan is a role-based wedding planning marketplace. Customers discover wedding services and send booking requests; vendors publish and manage services, handle bookings and upgrade to Premium; admins review services, manage users and monitor transactions. This repository contains the Next.js 16 frontend.

## Important Features

- Public home page, service catalogue with search/filter/sort, and private service details
- Better Auth email/password and Google sign-in, with short-lived JWTs for the Express API
- Customer, vendor and admin dashboards with server-side session and role verification
- Vendor service management (pending approval, free-plan limit of 3 active services)
- Booking requests with accept/reject/cancel and ownership checks
- Stripe Checkout upgrade flow with a read-only payment status page
- Profile settings with ImgBB image hosting
- Responsive wedding-themed UI built with ShadCN, Tailwind 4, Recharts and Motion

## Technology Stack

Next.js 16 (App Router, TypeScript), React 19, Better Auth 1.7 with MongoDB adapter, Tailwind CSS 4, ShadCN, Recharts, Framer Motion, sonner, lucide-react.

## Installation

```bash
git clone https://github.com/NazmulHossain2905/wedplan-client.git
cd wedplan-client
npm install
cp .env.example .env   # Windows: Copy-Item .env.example .env
```

Fill in `.env`. Secrets (Better Auth secret, MongoDB URI, Google OAuth, ImgBB key) stay local and are never committed.

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Better Auth configuration and JWT signing |
| `MONGODB_URI`, `DB_NAME` | Database shared with the server |
| `NEXT_PUBLIC_API_URL` | Express API base URL, e.g. `http://localhost:5000` |
| `ADMIN_EMAILS` | Comma-separated emails allowed to register as admin; leave empty otherwise |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google login |
| `IMGBB_API_KEY` | Image hosting |

**Creating an admin:** add the email to `ADMIN_EMAILS`, restart Next.js, then sign up normally with that email. Public sign-ups can only become customers or vendors.

## Run Locally

```bash
npm run dev      # http://localhost:3000
npm run build && npm start   # production
npm run lint
```

Start `wedplan-server` (`npm start`, port 5000) at the same time; the client sends `Authorization: Bearer <JWT>` to it through `src/lib/api.ts`.

## Links

- Live website: _to be added after deployment_
- Client repository: https://github.com/NazmulHossain2905/wedplan-client
- Server repository: https://github.com/NazmulHossain2905/wedplan-server
