"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OUTCOMES: { value: string; label: string }[] = [
  { value: "POSITIVE", label: "مثبت 🙂" },
  { value: "NEUTRAL", label: "خنثی 😐" },
  { value: "FOLLOW_UP", label: "نیاز به پیگیری 🔁" },
  { value: "NEGATIVE", label: "منفی 🙁" },
];

const OUTCOME_LABELS: Record<string, string> = {
  POSITIVE: "مثبت 🙂",
  NEUTRAL: "خنثی 😐",
  FOLLOW_UP: "نیاز به پیگیری 🔁",
  NEGATIVE: "منفی 🙁",
};

type Item = {
  id: number;
  doctor_name: string;
  specialty: string | null;
  address: string | null;
  done: number;
  outcome: string | null;
  note: string | null;
  completed_at: string | null;
};

export default function PlanVisitItem({ item }: { item: Item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState(item.outcome ?? "POSITIVE");
  const [note, setNote] = useState(item.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/plan-visits/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, note }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ثبت.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-neutral-900">{item.doctor_name}</p>
          <p className="text-xs text-neutral-500">{item.specialty || item.address || ""}</p>
        </div>
        {item.done ? (
          <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
            {item.outcome ? OUTCOME_LABELS[item.outcome] : "انجام شد"}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">در انتظار</span>
        )}
      </div>

      {item.done && !open && (
        <div className="mt-2 flex items-center justify-between">
          {item.note && <p className="text-xs text-neutral-500">📝 {item.note}</p>}
          <button type="button" onClick={() => setOpen(true)} className="mr-auto text-xs font-medium text-brand-dark hover:underline">
            ✏️ ویرایش نتیجه
          </button>
        </div>
      )}

      {!item.done && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          ✓ ثبت نتیجه ویزیت
        </button>
      )}

      {open && (
        <div className="mt-3 space-y-3 border-t border-neutral-100 pt-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-neutral-600">نتیجه ویزیت</p>
            <div className="grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOutcome(o.value)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium ${
                    outcome === o.value ? "border-brand bg-brand-light text-brand-dark" : "border-neutral-300 text-neutral-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="یادداشت (اختیاری)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "..." : "ثبت"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
