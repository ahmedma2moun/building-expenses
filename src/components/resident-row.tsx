"use client";

import { useState } from "react";
import { toggleResidentArchived, updateResident } from "@/app/actions";

type Resident = {
  id: string;
  name: string;
  isResident: boolean;
  note: string | null;
  archived: boolean;
};

export function ResidentRow({ resident: r }: { resident: Resident }) {
  const [editing, setEditing] = useState(false);
  const toggleArchived = toggleResidentArchived.bind(null, r.id, !r.archived);
  const save = updateResident.bind(null, r.id);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await save(formData);
          setEditing(false);
        }}
        className={`space-y-3 rounded-xl border border-neutral-300 bg-white px-4 py-3 ${
          r.archived ? "opacity-50" : ""
        }`}
      >
        <div>
          <label className="mb-1 block text-xs text-neutral-500">الاسم</label>
          <input
            name="name"
            defaultValue={r.name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="isResident"
            defaultChecked={r.isResident}
            className="h-4 w-4 rounded border-neutral-300"
          />
          مقيم بالعمارة
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white active:bg-neutral-700"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-600"
          >
            إلغاء
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
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
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-neutral-500"
        >
          تعديل
        </button>
        <form action={toggleArchived}>
          <button type="submit" className="text-xs text-neutral-500">
            {r.archived ? "إعادة تفعيل" : "أرشفة"}
          </button>
        </form>
      </div>
    </div>
  );
}
