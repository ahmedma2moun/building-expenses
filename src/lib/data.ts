import { prisma } from "@/lib/prisma";

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

  return { ...summarize(budget), contributions: budget.contributions, expenses: budget.expenses };
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
