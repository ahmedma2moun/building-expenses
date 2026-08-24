import Link from "next/link";
import { getBudgetSummaries } from "@/lib/data";
import { money } from "@/lib/format";
import { createBudget } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const budgets = await getBudgetSummaries();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-bold">الميزانيات</h1>
        <div className="mt-4 space-y-2">
          {budgets.map((b) => (
            <Link
              key={b.id}
              href={`/budgets/${b.id}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 active:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{b.name}</p>
                <p className="text-xs text-neutral-500">
                  {b.type === "MONTHLY" ? `شهرية · ${b.year ?? ""}` : "صندوق عام"}
                  {b.closed ? " · مغلقة" : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                {money(b.target)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">إضافة ميزانية جديدة</h2>
        <form action={createBudget} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">الاسم</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              placeholder="مثال: الميزانية الشهرية 2027"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">النوع</label>
              <select
                name="type"
                required
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              >
                <option value="MONTHLY">شهرية</option>
                <option value="GENERAL">صندوق عام</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">السنة (للشهرية)</label>
              <input
                name="year"
                type="number"
                defaultValue={new Date().getFullYear()}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-500">الميزانية المستهدفة</label>
            <input
              name="targetAmount"
              type="number"
              step="0.01"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-base font-medium text-white active:bg-neutral-700"
          >
            إضافة
          </button>
        </form>
      </section>
    </div>
  );
}
