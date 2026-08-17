"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PharmacyInitial = {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  notes: string | null;
};

export default function PharmacyForm({ initial }: { initial?: PharmacyInitial }) {
  const router = useRouter();
  const editing = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    notes: initial?.notes ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("نام داروخانه الزامی است.");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/pharmacies/${initial!.id}` : "/api/pharmacies";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        notes: form.notes || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ذخیره اطلاعات.");
      return;
    }
    const targetId = editing ? initial!.id : data.id;
    router.push(`/dashboard/pharmacies/${targetId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">نام داروخانه *</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">آدرس</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">تلفن</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">یادداشت</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {saving ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ثبت داروخانه"}
      </button>
    </form>
  );
}
