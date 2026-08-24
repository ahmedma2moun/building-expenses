# ميزانية فيلا 113

A small mobile-friendly web app for tracking the building's monthly dues and
one-off project funds — replaces the shared Google Sheet.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL (Supabase)
- Single shared-password auth (no user accounts)

## Data model

- **Resident** — a resident or owner (`isResident` flags residents vs.
  off-site owners; `archived` hides them from new-entry forms without
  deleting history).
- **Budget** — either `MONTHLY` (has a `year`, e.g. "الميزانية الشهرية 2026")
  or `GENERAL` (a project fund like "الصندوق", no year).
- **Contribution** — a payment from a resident into a budget. For monthly
  budgets `period` is `YYYY-MM`; for general funds it's a free-text label
  (e.g. "الدفعة الأولى").
- **Expense** — a spend from a budget (item, date, amount).

Totals (collected, spent, remaining) are computed on the fly from
contributions/expenses rather than stored, so they're always consistent.

## Local development

```bash
npm install
npx prisma migrate dev   # apply schema, using DIRECT_URL
npm run db:seed          # optional: load the historical 2025/2026 sheet data
npm run dev
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `DIRECT_URL`, and
`ADMIN_PASSWORD` (the shared password that gates the whole app).

### Why two database URLs

Supabase (and most managed Postgres) offers two pooler endpoints:

- **Transaction pooler** (port `6543`, `?pgbouncer=true`) — multiplexes many
  short-lived connections into few real Postgres connections. Required for
  serverless (Vercel): every function invocation opens its own connection,
  and a session-mode pooler's small connection cap (e.g. 15) gets exhausted
  almost immediately otherwise. **This is what `DATABASE_URL` must point
  to** — it's what the running app uses (`src/lib/prisma.ts`).
- **Session/direct connection** (port `5432`) — needed for migrations,
  which rely on session-level features (advisory locks) the transaction
  pooler doesn't support. **This is what `DIRECT_URL` must point to** —
  it's used only by the Prisma CLI (`prisma.config.ts`), for `migrate dev`
  / `migrate deploy` / `db pull`.

Using the transaction pooler for migrations (or vice versa) causes
`prisma migrate` to hang indefinitely rather than fail — if that happens,
double check which URL is set to which port.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the GitHub repo.
3. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — Supabase transaction pooler, port `6543`,
     `?pgbouncer=true` appended
   - `DIRECT_URL` — Supabase session/direct connection, port `5432`
   - `ADMIN_PASSWORD` — a real password (not the local dev one)
4. Deploy. `prisma generate` runs via `postinstall`, and `prisma migrate
   deploy` runs automatically as part of `npm run build` before `next
   build` — so every deploy applies any pending migrations to `DIRECT_URL`
   first.

## Notes on the migrated sheet data

The seed script (`prisma/seed.ts`) reproduces the 2025 and 2026 monthly
budgets and the "الصندوق" project fund from the original sheet. All totals
were cross-checked against the sheet's own summary rows and reconcile
exactly. Two names only appeared in the fund sheet with no residency tag
(`شريف`, `سهام العجلتي`) — they were seeded as non-resident owners; rename or
merge them from the السكان page if that's not accurate.
