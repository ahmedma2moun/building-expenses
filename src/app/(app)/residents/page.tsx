import { prisma } from "@/lib/prisma";
import { createResident, toggleResidentArchived } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function ResidentsPage() {
  const residents = await prisma.resident.findMany({
    orderBy: [{ archived: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-bold">السكان والملاك</h1>
        <div className="mt-4 space-y-2">
          {residents.map((r) => {
            const toggle = toggleResidentArchived.bind(null, r.id, !r.archived);
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 ${
                  r.archived ? "opacity-50" : ""
                }`}
              >
                <div>
                  <p className="font-medium text-neutral-900">{r.name}</p>
                  <p className="text-xs text-neutral-500">
                    {r.isResident ? "مقيم" : "غير مقيم"}
                    {r.note ? ` · ${r.note}` : ""}
                  </p>
                </div>
                <form action={toggle}>
                  <button type="submit" className="text-xs text-neutral-500">
                    {r.archived ? "إعادة تفعيل" : "أرشفة"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold">إضافة ساكن / مالك</h2>
        <form action={createResident} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">الاسم</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base outline-none focus:border-neutral-900"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isResident"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300"
            />
            مقيم بالعمارة
          </label>

          <div>
            <label className="mb-1 block text-xs text-neutral-500">ملاحظة (اختياري)</label>
            <input
              name="note"
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
