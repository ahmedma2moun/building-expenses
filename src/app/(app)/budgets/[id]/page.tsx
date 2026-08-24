import { notFound } from "next/navigation";
import { getBudgetDetail } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { money, monthOptions } from "@/lib/format";
import { addContribution, addExpense, deleteExpense, toggleBudgetClosed } from "@/app/actions";

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
        <h2 className="mb-3 text-sm font-semibold">جدول المساهمات</h2>
        {budget.contributionGrid.type === "MONTHLY" ? (
          <MonthlyGrid grid={budget.contributionGrid} />
        ) : (
          <PeriodGrid grid={budget.contributionGrid} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">المصروفات ({budget.expenses.length})</h2>

        {budget.expenses.length === 0 && (
          <p className="text-sm text-neutral-400">لا توجد مصروفات بعد</p>
        )}

        {budget.monthlyBreakdown ? (
          <div className="space-y-3">
            {budget.monthlyBreakdown
              .filter((m) => m.collected > 0 || m.spent > 0)
              .map((m) => (
                <div
                  key={m.period}
                  className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-neutral-50 px-3 py-2">
                    <span className="text-sm font-semibold text-neutral-900">{m.label}</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-neutral-500">
                      <span>محصل {money(m.collected)}</span>
                      <span>مصروف {money(m.spent)}</span>
                      <span
                        className={`font-semibold ${
                          m.remaining < 0 ? "text-red-600" : "text-neutral-900"
                        }`}
                      >
                        متبقي {money(m.remaining)}
                      </span>
                    </div>
                  </div>
                  {m.expenses.length > 0 && (
                    <ExpenseTable
                      expenses={m.expenses}
                      onDelete={(expenseId) => deleteExpenseWithId.bind(null, expenseId, budget.id)}
                    />
                  )}
                </div>
              ))}
          </div>
        ) : (
          budget.expenses.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <ExpenseTable
                expenses={budget.expenses}
                onDelete={(expenseId) => deleteExpenseWithId.bind(null, expenseId, budget.id)}
                showHeader
              />
            </div>
          )
        )}
      </section>
    </div>
  );
}

function ExpenseTable({
  expenses,
  onDelete,
  showHeader,
}: {
  expenses: { id: string; item: string; amount: unknown; date: Date }[];
  onDelete: (id: string) => (formData: FormData) => Promise<void>;
  showHeader?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      {showHeader && (
        <thead>
          <tr className="border-b border-neutral-200 text-right text-[11px] text-neutral-500">
            <th className="px-3 py-2 font-medium">البند</th>
            <th className="px-3 py-2 font-medium">التاريخ</th>
            <th className="px-3 py-2 font-medium">المبلغ</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
      )}
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id} className="border-t border-neutral-100 first:border-t-0">
            <td className="px-3 py-2 text-neutral-900">{e.item}</td>
            <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-500">
              {new Date(e.date).toLocaleDateString("ar-EG")}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-neutral-900">
              {money(Number(e.amount))}
            </td>
            <td className="px-2 py-2 text-left">
              <form action={onDelete(e.id)}>
                <button type="submit" className="text-xs text-red-500">
                  حذف
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function num(amount: number) {
  return amount.toLocaleString("ar-EG");
}

type GridResident = { id: string; name: string; isResident: boolean };

function MonthlyGrid({
  grid,
}: {
  grid: {
    residents: GridResident[];
    months: {
      period: string;
      label: string;
      cells: Record<string, number>;
      total: number;
      isPastOrCurrent: boolean;
    }[];
    residentTotals: Record<string, number>;
    grandTotal: number;
  };
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky right-0 z-10 whitespace-nowrap bg-neutral-50 px-2 py-2 text-right font-medium text-neutral-500">
              الشهر
            </th>
            {grid.residents.map((r) => (
              <th
                key={r.id}
                className="whitespace-nowrap px-2 py-2 text-center font-medium text-neutral-500"
              >
                {r.name}
              </th>
            ))}
            <th className="whitespace-nowrap bg-neutral-50 px-2 py-2 text-center font-semibold text-neutral-700">
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {grid.months.map((m) => (
            <tr key={m.period} className="border-t border-neutral-100">
              <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-2 py-1.5 font-medium text-neutral-900">
                {m.label}
              </td>
              {grid.residents.map((r) => {
                const amount = m.cells[r.id] ?? 0;
                const missing = m.isPastOrCurrent && r.isResident && amount === 0;
                return (
                  <td
                    key={r.id}
                    className={`whitespace-nowrap px-2 py-1.5 text-center ${
                      missing
                        ? "bg-red-50 font-semibold text-red-600"
                        : amount > 0
                          ? "text-neutral-700"
                          : "text-neutral-300"
                    }`}
                  >
                    {amount > 0 ? num(amount) : missing ? "لم يدفع" : "—"}
                  </td>
                );
              })}
              <td className="whitespace-nowrap bg-neutral-50 px-2 py-1.5 text-center font-semibold text-neutral-900">
                {num(m.total)}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold text-neutral-900">
            <td className="sticky right-0 z-10 whitespace-nowrap bg-neutral-50 px-2 py-2">
              الإجمالي
            </td>
            {grid.residents.map((r) => (
              <td key={r.id} className="whitespace-nowrap px-2 py-2 text-center">
                {num(grid.residentTotals[r.id] ?? 0)}
              </td>
            ))}
            <td className="whitespace-nowrap px-2 py-2 text-center">{num(grid.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function PeriodGrid({
  grid,
}: {
  grid: {
    residents: GridResident[];
    rows: { period: string; cells: Record<string, number>; total: number }[];
    residentTotals: Record<string, number>;
    grandTotal: number;
  };
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky right-0 z-10 whitespace-nowrap bg-neutral-50 px-2 py-2 text-right font-medium text-neutral-500">
              الدفعة
            </th>
            {grid.residents.map((r) => (
              <th
                key={r.id}
                className="whitespace-nowrap px-2 py-2 text-center font-medium text-neutral-500"
              >
                {r.name}
              </th>
            ))}
            <th className="whitespace-nowrap bg-neutral-50 px-2 py-2 text-center font-semibold text-neutral-700">
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {grid.rows.map((row) => (
            <tr key={row.period} className="border-t border-neutral-100">
              <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-2 py-1.5 font-medium text-neutral-900">
                {row.period}
              </td>
              {grid.residents.map((r) => {
                const amount = row.cells[r.id] ?? 0;
                return (
                  <td
                    key={r.id}
                    className={`whitespace-nowrap px-2 py-1.5 text-center ${
                      amount > 0 ? "text-neutral-700" : "text-neutral-300"
                    }`}
                  >
                    {amount > 0 ? num(amount) : "—"}
                  </td>
                );
              })}
              <td className="whitespace-nowrap bg-neutral-50 px-2 py-1.5 text-center font-semibold text-neutral-900">
                {num(row.total)}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-neutral-300 bg-neutral-50 font-semibold text-neutral-900">
            <td className="sticky right-0 z-10 whitespace-nowrap bg-neutral-50 px-2 py-2">
              الإجمالي
            </td>
            {grid.residents.map((r) => (
              <td key={r.id} className="whitespace-nowrap px-2 py-2 text-center">
                {num(grid.residentTotals[r.id] ?? 0)}
              </td>
            ))}
            <td className="whitespace-nowrap px-2 py-2 text-center">{num(grid.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
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
