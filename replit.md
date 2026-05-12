# TravelPortal

A full-featured travel agency portal for managing Umrah packages, KSA/UAE flight groups, bookings, e-tickets, ledger, and bank accounts — with role-based dashboards for customers, agents, and admins.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter routing + TanStack Query + shadcn/ui + lucide-react
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle table definitions (users, packages, flights, bookings, ledger, banks)
- `lib/api-spec/openapi.yaml` — OpenAPI 3.0 spec (source of truth for all types)
- `lib/api-zod/src/generated/` — Zod schemas generated from OpenAPI (used in API server)
- `lib/api-client-react/src/generated/` — React Query hooks generated from OpenAPI (used in frontend)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, packages, flights, bookings, tickets, ledger, banks, dashboard, admin, agents)
- `artifacts/travel-portal/src/pages/` — All React pages

## Architecture decisions

- Contract-first: OpenAPI spec drives all types via Orval codegen; never handwrite API client code
- Auth via base64 token (no JWT library) stored in localStorage; AuthContext wraps the app
- On-Hold booking: 2-hour countdown via `setInterval` in React; `holdExpiresAt` stored in DB
- Path-based proxy routing: frontend at `/`, API at `/api`
- All protected pages redirect to `/login` via `useEffect` on `isAuthenticated`

## Product

- **Home** — Marketing landing page with CTA
- **Auth** — Login, Signup, Forgot Password
- **Umrah Packages** — 21/28 day packages with hotel/airline filters, Book Now / On Hold
- **KSA One Way Groups** — Pakistan → Saudi Arabia flights with airline/date filters
- **UAE One Way Groups** — Pakistan → UAE flights
- **All Groups** — Combined view of all flight groups
- **Umrah Tickets** — Individual Umrah air tickets
- **My Bookings** — Full booking list with status, hold countdown timer
- **Booking Detail** — Individual booking with confirm/cancel/hold actions + E-Ticket link
- **E-Ticket** — Airline-style printable boarding pass with barcode
- **Banks** — Bank account management
- **My Ledger** — Transaction history with credit/debit/balance
- **Agent Dashboard** — Agent-specific stats and booking list (role-gated)
- **Admin Panel** — User management, all bookings, agent performance (role-gated)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelportal.com | admin123 |
| Agent | agent@travelportal.com | agent123 |
| Customer | customer@travelportal.com | customer123 |

## Seeded Data

- 6 Umrah packages (21/28 day, economy/silver/gold/premium)
- 8 KSA one-way flights, 5 UAE one-way flights, 5 Umrah tickets (18 total)
- 3 bank accounts (HBL, UBL, MCB)
- 8 ledger entries
- 5 users (1 admin, 2 agents, 2 customers)

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Then rebuild libs: `pnpm run typecheck:libs`
- The API server must be started before the frontend can fetch data
- `PORT` env var is auto-injected by the Replit workflow system; do not hardcode ports

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
