import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Keep the per-instance connection footprint tiny: on serverless platforms
// (Vercel) each function instance gets its own pool, and DATABASE_URL is
// expected to point at a transaction-mode pooler (e.g. Supabase's :6543
// pgbouncer endpoint) that multiplexes many such small pools into a
// bounded number of real Postgres connections.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10_000,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
