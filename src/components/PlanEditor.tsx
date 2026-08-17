"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OUTCOME_LABELS: Record<string, string> = {
  POSITIVE: "مثبت",
  NEUTRAL: "خنثی",
  FOLLOW_UP: "نیاز به پیگیری",
  NEGATIVE: "منفی",
};

const OUTCOME_BADGE: Record<string, string> = {
  POSITIVE: "bg-green-50 text-green-700",
  NEUTRAL: "bg-neutral-100 text-neutral-600",
  FOLLOW_UP: "bg-amber-50 text-amber-700",
  NEGATIVE: "bg-red-50 text-red-700",
};

type PlanItem = {
  id: number;
  doctor_id: number;
  doctor_name: string;
  done: number;
  outcome: string | null;
  note: string | null;
  completed_at: string | null;
};

export default function PlanEditor({
  repId,
  weekStart,
  allDoctors,
  items,
}: {
  repId: number;
  weekStart: string;
  allDoctors: { id: number; name: string }[];
  items: PlanItem[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set(items.map((i) => i.doctor_id)));
  const [saving, setSaving] = useState(false);
  const doneIds = new Set(items.filter((i) => i.done).map((i) => i.doctor_id));
  const doneCount = items.filter((i) => i.done).length;

  function toggle(doctorId: number) {
    if (doneIds.has(doctorId)) return; // completed visits can't be unassigned
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(doctorId)) next.delete(doctorId);
      else next.add(doctorId);
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId, weekStart, doctorIds: Array.from(selected) }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            {doneCount} از {items.length} پزشک ویزیت شده
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-brand-light/40"
          >
            ✏️ ویرایش برنامه
          </button>
        </div>
        {items.length > 0 && (
          <ul className="mt-3 divide-y divide-brand-light/60 border-t border-brand-light/60">
            {items.map((it) => (
              <li key={it.id} className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm ${it.done ? "bg-brand-light/20" : ""}`}>
                <span className="text-neutral-800">
                  {it.done && <span className="ml-1 text-brand-dark">✓</span>}
                  {it.doctor_name}
                </span>
                {it.done ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      it.outcome ? OUTCOME_BADGE[it.outcome] : "bg-brand-light text-brand-dark"
                    }`}
                  >
                    {it.outcome ? OUTCOME_LABELS[it.outcome] : "انجام شد"}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">در انتظار</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs text-neutral-500">پزشکانی که این هفته برای این ویزیتور برنامه‌ریزی می‌شوند را انتخاب کنید:</p>
      <div className="max-h-64 overflow-y-auto rounded-lg border border-brand-light">
        {allDoctors.map((d) => {
          const locked = doneIds.has(d.id);
          return (
            <label
              key={d.id}
              className={`flex items-center gap-2 border-b border-brand-light/60 px-3 py-2 text-sm last:border-b-0 ${
                locked ? "bg-brand-light/20 text-neutral-400" : "text-neutral-800 hover:bg-brand-light/20"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(d.id)}
                onChange={() => toggle(d.id)}
                disabled={locked}
                className="h-4 w-4 accent-brand"
              />
              {d.name}
              {locked && <span className="mr-auto text-xs">(ویزیت شده)</span>}
            </label>
          );
        })}
        {allDoctors.length === 0 && <p className="p-3 text-center text-sm text-neutral-400">هنوز پزشکی ثبت نشده است.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "..." : "ذخیره برنامه"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelected(new Set(items.map((i) => i.doctor_id)));
            setEditing(false);
          }}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-brand-light/40"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}
