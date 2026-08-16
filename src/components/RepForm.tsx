"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RepInitial = {
  id: number;
  name: string;
  username: string;
  region: string | null;
  monthly_target: number;
};

export default function RepForm({ initial }: { initial?: RepInitial }) {
  const router = useRouter();
  const editing = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    username: initial?.username ?? "",
    password: "",
    region: initial?.region ?? "",
    monthly_target: initial?.monthly_target ?? 60,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.username.trim()) {
      setError("نام و نام کاربری الزامی است.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setError("رمز عبور برای ویزیتور جدید الزامی است.");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/reps/${initial!.id}` : "/api/reps";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        username: form.username,
        password: form.password || undefined,
        region: form.region || null,
        monthly_target: Number(form.monthly_target) || 60,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ذخیره اطلاعات.");
      return;
    }
    const targetId = editing ? initial!.id : data.id;
    router.push(`/dashboard/reps/${targetId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">نام و نام خانوادگی *</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">نام کاربری (ورود) *</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            dir="ltr"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {editing ? "رمز عبور جدید (اختیاری)" : "رمز عبور *"}
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            dir="ltr"
            placeholder={editing ? "خالی بگذارید تا تغییر نکند" : ""}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">منطقه</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.region}
            onChange={(e) => setField("region", e.target.value)}
            placeholder="مثلاً تهران - شمال"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">هدف ماهانه (تعداد ویزیت)</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.monthly_target}
            onChange={(e) => setField("monthly_target", Number(e.target.value))}
          />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {saving ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ثبت ویزیتور"}
      </button>
    </form>
  );
}
