"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AllocateStockForm({
  repId,
  products,
}: {
  repId: number;
  products: { id: number; name: string; unit_label: string }[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [delta, setDelta] = useState(10);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId, productId, delta }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("موجودی به‌روزرسانی شد.");
      router.refresh();
    } else {
      setMsg("خطا در ثبت.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">محصول</label>
        <select
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">مقدار (+/-)</label>
        <input
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "..." : "اعمال تغییر"}
      </button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </form>
  );
}
