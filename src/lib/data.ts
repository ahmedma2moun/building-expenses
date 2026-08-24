import { prisma } from "@/lib/prisma";
import { MONTH_NAMES, MONTH_ORDER } from "@/lib/format";

export function toNumber(value: { toNumber: () => number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}

export async function getBudgetSummaries() {
  const budgets = await prisma.budget.findMany({
    orderBy: [{ type: "asc" }, { year: "desc" }, { createdAt: "desc" }],
    include: {
      contributions: true,
      expenses: true,
    },
  });

  return budgets.map((b) => summarize(b));
}

export function expenseMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getBudgetDetail(id: string) {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: {
      contributions: {
        include: { resident: true },
        orderBy: [{ period: "asc" }, { createdAt: "asc" }],
      },
      expenses: { orderBy: { date: "asc" } },
    },
  });

  if (!budget) return null;

  const monthlyBreakdown =
    budget.type === "MONTHLY" && budget.year
      ? buildMonthlyBreakdown(budget.year, budget.contributions, budget.expenses)
      : null;

  const allResidents = await prisma.resident.findMany({
    orderBy: [{ isResident: "desc" }, { name: "asc" }],
  });
  const contributedResidentIds = new Set(budget.contributions.map((c) => c.residentId));
  const gridResidents = allResidents.filter((r) => !r.archived || contributedResidentIds.has(r.id));

  const contributionGrid =
    budget.type === "MONTHLY" && budget.year
      ? buildMonthlyGrid(budget.year, gridResidents, budget.contributions)
      : buildPeriodGrid(gridResidents, budget.contributions);

  return {
    ...summarize(budget),
    contributions: budget.contributions,
    expenses: budget.expenses,
    monthlyBreakdown,
    contributionGrid,
  };
}

type GridResident = { id: string; name: string; isResident: boolean; archived: boolean };

function buildMonthlyGrid(
  year: number,
  residents: GridResident[],
  contributions: { residentId: string; period: string; amount: { toNumber: () => number } }[],
) {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const months = MONTH_ORDER.map((monthNum) => {
    const period = `${year}-${monthNum}`;
    const cells: Record<string, number> = {};
    for (const r of residents) cells[r.id] = 0;
    let total = 0;
    for (const c of contributions) {
      if (c.period !== period) continue;
      cells[c.residentId] = (cells[c.residentId] ?? 0) + toNumber(c.amount);
      total += toNumber(c.amount);
    }
    return { period, label: MONTH_NAMES[monthNum], cells, total, isPastOrCurrent: period <= currentPeriod };
  });

  const residentTotals: Record<string, number> = {};
  for (const r of residents) residentTotals[r.id] = 0;
  let grandTotal = 0;
  for (const c of contributions) {
    residentTotals[c.residentId] = (residentTotals[c.residentId] ?? 0) + toNumber(c.amount);
    grandTotal += toNumber(c.amount);
  }

  return { type: "MONTHLY" as const, residents, months, residentTotals, grandTotal };
}

function buildPeriodGrid(
  residents: GridResident[],
  contributions: {
    residentId: string;
    period: string;
    amount: { toNumber: () => number };
    createdAt: Date;
  }[],
) {
  const periodFirstSeen = new Map<string, number>();
  for (const c of contributions) {
    const seenAt = c.createdAt.getTime();
    const existing = periodFirstSeen.get(c.period);
    if (existing === undefined || seenAt < existing) periodFirstSeen.set(c.period, seenAt);
  }
  const periods = [...periodFirstSeen.keys()].sort(
    (a, b) => periodFirstSeen.get(a)! - periodFirstSeen.get(b)!,
  );

  const rows = periods.map((period) => {
    const cells: Record<string, number> = {};
    for (const r of residents) cells[r.id] = 0;
    let total = 0;
    for (const c of contributions) {
      if (c.period !== period) continue;
      cells[c.residentId] = (cells[c.residentId] ?? 0) + toNumber(c.amount);
      total += toNumber(c.amount);
    }
    return { period, cells, total };
  });

  const residentTotals: Record<string, number> = {};
  for (const r of residents) residentTotals[r.id] = 0;
  let grandTotal = 0;
  for (const c of contributions) {
    residentTotals[c.residentId] = (residentTotals[c.residentId] ?? 0) + toNumber(c.amount);
    grandTotal += toNumber(c.amount);
  }

  return { type: "GENERAL" as const, residents, rows, residentTotals, grandTotal };
}

function buildMonthlyBreakdown(
  year: number,
  contributions: { amount: { toNumber: () => number }; period: string }[],
  expenses: { id: string; item: string; amount: { toNumber: () => number }; date: Date }[],
) {
  return MONTH_ORDER.map((monthNum) => {
    const period = `${year}-${monthNum}`;
    const monthExpenses = expenses.filter((e) => expenseMonthKey(e.date) === period);
    const collected = contributions
      .filter((c) => c.period === period)
      .reduce((sum, c) => sum + toNumber(c.amount), 0);
    const spent = monthExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

    return {
      period,
      label: MONTH_NAMES[monthNum],
      collected,
      spent,
      remaining: collected - spent,
      expenses: monthExpenses,
    };
  });
}

function summarize<
  T extends {
    id: string;
    name: string;
    type: "MONTHLY" | "GENERAL";
    year: number | null;
    targetAmount: { toNumber: () => number };
    closed: boolean;
    contributions: { amount: { toNumber: () => number } }[];
    expenses: { amount: { toNumber: () => number } }[];
  },
>(b: T) {
  const target = toNumber(b.targetAmount);
  const collected = b.contributions.reduce((sum, c) => sum + toNumber(c.amount), 0);
  const spent = b.expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

  return {
    id: b.id,
    name: b.name,
    type: b.type,
    year: b.year,
    closed: b.closed,
    target,
    collected,
    spent,
    remainingOfTarget: target - spent,
    balance: collected - spent,
  };
}
