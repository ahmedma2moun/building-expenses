import { prisma } from "@/lib/prisma";
import { MONTH_NAMES } from "@/lib/format";

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

  return {
    ...summarize(budget),
    contributions: budget.contributions,
    expenses: budget.expenses,
    monthlyBreakdown,
  };
}

function buildMonthlyBreakdown(
  year: number,
  contributions: { amount: { toNumber: () => number }; period: string }[],
  expenses: { id: string; item: string; amount: { toNumber: () => number }; date: Date }[],
) {
  return Object.keys(MONTH_NAMES).map((monthNum) => {
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
