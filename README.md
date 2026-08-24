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
npx prisma migrate dev   # apply schema to DATABASE_URL
npm run db:seed          # optional: load the historical 2025/2026 sheet data
npm run dev
```

Copy `.env.example` to `.env` and fill in `DATABASE_URL` (Supabase connection
string) and `ADMIN_PASSWORD` (the shared password that gates the whole app).

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, "Add New Project" → import the GitHub repo.
3. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — the Supabase connection string
   - `ADMIN_PASSWORD` — a real password (not the local dev one)
4. Deploy. `prisma generate` runs automatically via the `postinstall` script.
5. Run `npx prisma migrate deploy` once (locally, pointed at the prod
   `DATABASE_URL`, or via a Vercel deploy hook) to apply schema changes to
   the production database — `migrate dev` is for local development only.

## Notes on the migrated sheet data

The seed script (`prisma/seed.ts`) reproduces the 2025 and 2026 monthly
budgets and the "الصندوق" project fund from the original sheet. All totals
were cross-checked against the sheet's own summary rows and reconcile
exactly. Two names only appeared in the fund sheet with no residency tag
(`شريف`, `سهام العجلتي`) — they were seeded as non-resident owners; rename or
merge them from the السكان page if that's not accurate.
