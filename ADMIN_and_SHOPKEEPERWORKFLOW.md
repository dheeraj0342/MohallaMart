## Admin & Shopkeeper Workflow Guide

This document explains how admin and shopkeeper flows work in MohallaMart, including routes, environment, data models, and debugging tips.

### 1) Environment & Services

- Set Convex deployment URL in `.env.local` and restart Next.js:
  - `NEXT_PUBLIC_CONVEX_URL=https://<your-subdomain>.convex.cloud`
- Start Convex while developing:
  - `npx convex dev`
- Admin credentials in `.env.local`:
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`

### 2) Key Routes

Admin

- `GET /admin/login` — Admin login page (server actions set a secure cookie)
- `GET /admin` — Admin dashboard (protected by `(protected)` layout)

Shopkeeper

- `GET /shopkeeper/signup` — Shopkeeper-specific signup
- `GET /shopkeeper/login` — Shopkeeper-specific login
- `GET /shopkeeper/apply` — Application page
- `GET /shopkeeper` — Shopkeeper dashboard (protected)

Debug (local only)

- `GET /api/debug/convex` — Writes a test user into Convex and returns a small sample
- `POST /api/debug/convex/apply` — Creates a pending shopkeeper application for a user (auto-picks latest if body is empty)
- `GET /api/debug/convex/state` — Returns counts for pending applications and shop owners

### 3) Data Flow

User Sync

- On Supabase login, the client calls Convex `users.syncUserWithSupabase` to ensure a `users` record exists.

Shopkeeper Application

- `/shopkeeper/apply` → user clicks “Submit Application”
  1. Convex mutation `users.requestShopkeeperRole`
     - Updates `users.role` → `shop_owner`
     - Sets `users.is_active` → `false`
     - Creates/updates a record in `shopkeeper_applications` with `status = "pending"`
  2. Inngest event `shopkeeper/applied` (via route) can be used for admin notifications

Admin Approval

- `/admin` lists pending applications via Convex queries:
  - `users.listPendingShopkeeperApplications` (preferred)
  - Fallback: `users.listShopkeepers({ is_active: false })`
- Approve action:
  - Convex mutation `users.setUserActiveStatus({ is_active: true })`
  - Updates `shopkeeper_applications.status = "approved"`
  - Inserts an `admin_audit_logs` record
  - Emits Inngest `shopkeeper/approved` for onboarding

### 4) Convex Schema (relevant parts)

- `users` — `{ id, name, email, role: "customer" | "shop_owner" | "admin", is_active, ... }`
- `shopkeeper_applications` — `{ applicant_id -> users._id, status: "pending" | "approved" | "rejected", reviewer_id?, notes?, created_at, updated_at }`
- `admin_audit_logs` — `{ action, target_user_id -> users._id, performed_by?, metadata?, created_at }`

### 5) UI Guarding & Auth

- Admin auth is cookie-based using env credentials.
- Shopkeeper dashboard is protected by `ShopkeeperGuard` (requires Supabase session, Convex role `shop_owner`, and `is_active = true`).

### 6) Troubleshooting

- Admin dashboard empty:
  - Ensure Convex is running: `npx convex dev`
  - Ensure `NEXT_PUBLIC_CONVEX_URL` matches your deployment; restart Next.js after change
  - Log out/in to sync user, then apply at `/shopkeeper/apply`
  - Use debug endpoints to force-create data:
    - `GET /api/debug/convex` → test user
    - `POST /api/debug/convex/apply` → pending application
    - `GET /api/debug/convex/state` → verify counts

### 7) Events (Inngest)

- `shopkeeper/applied` — sent after application; hook to notify admins
- `shopkeeper/approved` — sent after admin approval; hook to run onboarding tasks

### 8) Color & Styling

- All admin/shopkeeper pages use CSS variables from `globals.css`:
  - `--color-primary`, `--color-primary-hover`, `--color-secondary`, `--color-secondary-hover`

### 9) Checklist for New Environments

1. Set admin env keys
2. Set Convex URL and start Convex
3. Start Next.js
4. Create a user (signup) and log in
5. Submit an application at `/shopkeeper/apply`
6. Log in as admin → `/admin` → approve

### Quick Steps: Become a Shopkeeper

1. Go to `/shopkeeper/signup` and create your shopkeeper account.
2. After signup, log in at `/shopkeeper/login`.
3. Visit `/shopkeeper/apply` and click "Submit Application".
4. An admin reviews your request in `/admin` and approves it.
5. Once approved, access your dashboard at `/shopkeeper` (requires `role=shop_owner` and `is_active=true`).
