"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OUTCOMES: { value: string; label: string }[] = [
  { value: "POSITIVE", label: "مثبت 🙂" },
  { value: "NEUTRAL", label: "خنثی 😐" },
  { value: "FOLLOW_UP", label: "نیاز به پیگیری 🔁" },
  { value: "NEGATIVE", label: "منفی 🙁" },
];

const OUTCOME_CHIP_ACTIVE: Record<string, string> = {
  POSITIVE: "border-green-500 bg-green-50 text-green-700",
  NEUTRAL: "border-neutral-400 bg-neutral-100 text-neutral-700",
  FOLLOW_UP: "border-amber-500 bg-amber-50 text-amber-700",
  NEGATIVE: "border-red-500 bg-red-50 text-red-700",
};

export default function EditVisitForm({
  visitId,
  initialOutcome,
  initialNote,
  returnTo,
}: {
  visitId: number;
  initialOutcome: string | null;
  initialNote: string | null;
  returnTo: string;
}) {
  const router = useRouter();
  const [outcome, setOutcome] = useState(initialOutcome ?? "POSITIVE");
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/plan-visits/${visitId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, note }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ذخیره اطلاعات.");
      return;
    }
    router.push(returnTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">نتیجه ویزیت</label>
        <div className="flex flex-wrap gap-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOutcome(o.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                outcome === o.value ? OUTCOME_CHIP_ACTIVE[o.value] : "border-neutral-300 text-neutral-600 hover:bg-brand-light/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">یادداشت</label>
        <textarea
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-semibold text-white shadow-lg shadow-brand/25 hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </form>
  );
}
