"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderForm({ pharmacyId }: { pharmacyId: number }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [orderDate, setOrderDate] = useState(today);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!orderDate || quantity <= 0) {
      setError("تاریخ و تعداد سفارش را درست وارد کنید.");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/pharmacies/${pharmacyId}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderDate, quantity, note: note || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ثبت سفارش.");
      return;
    }
    setNote("");
    setQuantity(1);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">تاریخ سفارش</label>
        <input
          type="date"
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-700">تعداد</label>
        <input
          type="number"
          min={1}
          className="w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="mb-1 block text-xs font-medium text-neutral-700">یادداشت (اختیاری)</label>
        <input
          className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-brand"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "..." : "+ ثبت سفارش"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}
