"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"SAMPLE" | "GIFT">("SAMPLE");
  const [unit, setUnit] = useState("عدد");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, unit_label: unit }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("خطا در ثبت محصول.");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">نام محصول</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
          placeholder="مثلاً نمونه قرص ..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">نوع</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "SAMPLE" | "GIFT")}
          className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        >
          <option value="SAMPLE">نمونه دارویی</option>
          <option value="GIFT">هدیه تبلیغاتی</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">واحد</label>
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-20 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "..." : "+ افزودن محصول"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
