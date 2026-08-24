import Link from "next/link";
import { getBudgetSummaries } from "@/lib/data";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const budgets = await getBudgetSummaries();

  const monthly = budgets.filter((b) => b.type === "MONTHLY");
  const general = budgets.filter((b) => b.type === "GENERAL");

  const totalCollected = budgets.reduce((s, b) => s + b.collected, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">إجمالي المحصل</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{money(totalCollected)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-500">إجمالي المصروفات</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">{money(totalSpent)}</p>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">الميزانيات الشهرية</h2>
          <Link href="/budgets" className="text-sm text-neutral-500">
            إدارة →
          </Link>
        </div>
        {monthly.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {monthly.map((b) => (
              <BudgetCard key={b.id} budget={b} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">الصناديق العامة</h2>
          <Link href="/budgets" className="text-sm text-neutral-500">
            إدارة →
          </Link>
        </div>
        {general.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {general.map((b) => (
              <BudgetCard key={b.id} budget={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
      لا يوجد شيء بعد
    </div>
  );
}

function BudgetCard({
  budget,
}: {
  budget: Awaited<ReturnType<typeof getBudgetSummaries>>[number];
}) {
  const pct = budget.target > 0 ? Math.min(100, Math.round((budget.spent / budget.target) * 100)) : 0;

  return (
    <Link
      href={`/budgets/${budget.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900">{budget.name}</h3>
        {budget.closed && (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
            مغلقة
          </span>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : "bg-neutral-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <dt className="text-neutral-400">المحصل</dt>
          <dd className="mt-0.5 font-semibold text-neutral-900">{money(budget.collected)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">المصروفات</dt>
          <dd className="mt-0.5 font-semibold text-neutral-900">{money(budget.spent)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">المتبقي</dt>
          <dd
            className={`mt-0.5 font-semibold ${
              budget.remainingOfTarget < 0 ? "text-red-600" : "text-neutral-900"
            }`}
          >
            {money(budget.remainingOfTarget)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
