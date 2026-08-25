"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const residentSchema = z.object({
  name: z.string().trim().min(1),
  isResident: z.coerce.boolean(),
  note: z.string().trim().optional(),
});

export async function createResident(formData: FormData) {
  const data = residentSchema.parse({
    name: formData.get("name"),
    isResident: formData.get("isResident") === "on",
    note: formData.get("note") || undefined,
  });

  await prisma.resident.create({ data });
  revalidatePath("/residents");
}

export async function toggleResidentArchived(id: string, archived: boolean) {
  await prisma.resident.update({ where: { id }, data: { archived } });
  revalidatePath("/residents");
}

export async function updateResident(id: string, formData: FormData) {
  const data = residentSchema.omit({ note: true }).parse({
    name: formData.get("name"),
    isResident: formData.get("isResident") === "on",
  });

  await prisma.resident.update({ where: { id }, data });
  revalidatePath("/residents");
}

const budgetSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["MONTHLY", "GENERAL"]),
  year: z.coerce.number().int().optional(),
  targetAmount: z.coerce.number().nonnegative(),
});

export async function createBudget(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    type: formData.get("type"),
    year: formData.get("year") || undefined,
    targetAmount: formData.get("targetAmount"),
  };
  const data = budgetSchema.parse(raw);

  const budget = await prisma.budget.create({
    data: {
      name: data.name,
      type: data.type,
      year: data.type === "MONTHLY" ? data.year ?? new Date().getFullYear() : null,
      targetAmount: data.targetAmount,
    },
  });

  revalidatePath("/budgets");
  redirect(`/budgets/${budget.id}`);
}

export async function toggleBudgetClosed(id: string, closed: boolean) {
  await prisma.budget.update({ where: { id }, data: { closed } });
  revalidatePath("/budgets");
  revalidatePath(`/budgets/${id}`);
}

const contributionSchema = z.object({
  budgetId: z.string().min(1),
  residentId: z.string().min(1),
  amount: z.coerce.number().positive(),
  periods: z.array(z.string().trim().min(1)).min(1),
  paidDate: z.string().optional(),
  note: z.string().trim().optional(),
});

export async function addContribution(formData: FormData) {
  const data = contributionSchema.parse({
    budgetId: formData.get("budgetId"),
    residentId: formData.get("residentId"),
    amount: formData.get("amount"),
    periods: formData.getAll("period"),
    paidDate: formData.get("paidDate") || undefined,
    note: formData.get("note") || undefined,
  });

  await prisma.contribution.createMany({
    data: data.periods.map((period) => ({
      budgetId: data.budgetId,
      residentId: data.residentId,
      amount: data.amount,
      period,
      paidDate: data.paidDate ? new Date(data.paidDate) : new Date(),
      note: data.note,
    })),
  });

  revalidatePath(`/budgets/${data.budgetId}`);
}

export async function deleteContribution(id: string, budgetId: string) {
  await prisma.contribution.delete({ where: { id } });
  revalidatePath(`/budgets/${budgetId}`);
}

const expenseSchema = z.object({
  budgetId: z.string().min(1),
  item: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  note: z.string().trim().optional(),
});

export async function addExpense(formData: FormData) {
  const data = expenseSchema.parse({
    budgetId: formData.get("budgetId"),
    item: formData.get("item"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  await prisma.expense.create({
    data: {
      budgetId: data.budgetId,
      item: data.item,
      amount: data.amount,
      date: new Date(data.date),
      note: data.note,
    },
  });

  revalidatePath(`/budgets/${data.budgetId}`);
}

export async function deleteExpense(id: string, budgetId: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath(`/budgets/${budgetId}`);
}
