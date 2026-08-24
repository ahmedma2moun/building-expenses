import { notFound } from "next/navigation";
import { getBudgetDetail } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { money, monthOptions, periodLabel } from "@/lib/format";
import {
  addContribution,
  addExpense,
  deleteContribution,
  deleteExpense,
  toggleBudgetClosed,
} from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const budget = await getBudgetDetail(id);
  if (!budget) notFound();

  const residents = await prisma.resident.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
  });

  const deleteContributionWithId = deleteContribution.bind(null);
  const deleteExpenseWithId = deleteExpense.bind(null);
  const toggleClosed = toggleBudgetClosed.bind(null, budget.id, !budget.closed);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">{budget.name}</h1>
            <p className="text-sm text-neutral-500">
              {budget.type === "MONTHLY" ? `ميزانية شهرية · ${budget.year}` : "صندوق عام"}
            </p>
          </div>
          <form action={toggleClosed}>
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-600"
            >
              {budget.closed ? "إعادة فتح" : "إغلاق"}
            </button>
          </form>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="الميزانية المستهدفة" value={money(budget.target)} />
          <Stat label="المحصل" value={money(budget.collected)} />
          <Stat label="المصروفات" value={money(budget.spent)} />
          <Stat
            label="المتبقي من الميزانية"
            value={money(budget.remainingOfTarget)}
            danger={budget.remainingOfTarget < 0}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">تسجيل دفعة (مساهمة)</h2>
        <form action={addContribution} className="mt-3 space-y-3">
          <input type="hidden" name="budgetId" value={budget.id} />

          <div>
            <label className="mb-1 block text-xs text-neutral-500">الساكن</label>
            <select
              name="residentId"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
            >
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">المبلغ</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">
                {budget.type === "MONTHLY" ? "الشهر" : "الدفعة / البيان"}
              </label>
              {budget.type === "MONTHLY" ? (
                <select
                  name="period"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
                >
                  {monthOptions(budget.year ?? new Date().getFullYear()).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="period"
                  required
                  placeholder="مثال: الدفعة الأولى"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
                />
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-500">تاريخ الدفع</label>
            <input
              name="paidDate"
              type="date"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-base font-medium text-white active:bg-neutral-700"
          >
            إضافة دفعة
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">تسجيل مصروف</h2>
        <form action={addExpense} className="mt-3 space-y-3">
          <input type="hidden" name="budgetId" value={budget.id} />

          <div>
            <label className="mb-1 block text-xs text-neutral-500">البند</label>
            <input
              name="item"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">المبلغ</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">التاريخ</label>
              <input
                name="date"
                type="date"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-base font-medium text-white active:bg-neutral-700"
          >
            إضافة مصروف
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">الدفعات ({budget.contributions.length})</h2>
        <div className="space-y-2">
          {budget.contributions.length === 0 && (
            <p className="text-sm text-neutral-400">لا توجد دفعات بعد</p>
          )}
          {budget.contributions.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{c.resident.name}</p>
                <p className="text-xs text-neutral-500">{periodLabel(c.period)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-neutral-900">{money(Number(c.amount))}</span>
                <form action={deleteContributionWithId.bind(null, c.id, budget.id)}>
                  <button type="submit" className="text-xs text-red-500">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">المصروفات ({budget.expenses.length})</h2>
        <div className="space-y-2">
          {budget.expenses.length === 0 && (
            <p className="text-sm text-neutral-400">لا توجد مصروفات بعد</p>
          )}
          {budget.expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{e.item}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(e.date).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-neutral-900">{money(Number(e.amount))}</span>
                <form action={deleteExpenseWithId.bind(null, e.id, budget.id)}>
                  <button type="submit" className="text-xs text-red-500">
                    حذف
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-sm font-bold ${danger ? "text-red-600" : "text-neutral-900"}`}>
        {value}
      </p>
    </div>
  );
}
