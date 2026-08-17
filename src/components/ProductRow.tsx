"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";

type Product = {
  id: number;
  name: string;
  type: "SAMPLE" | "GIFT";
  unit_label: string;
};

export default function ProductRow({ product }: { product: Product }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: product.name, type: product.type, unit_label: product.unit_label });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave() {
    if (!form.name.trim()) {
      setError("نام محصول الزامی است.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ذخیره.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <tr className="border-t border-neutral-100 bg-neutral-50">
        <td className="px-4 py-2">
          <input
            className="w-full rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-brand"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </td>
        <td className="px-4 py-2">
          <select
            className="rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-brand"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "SAMPLE" | "GIFT" }))}
          >
            <option value="SAMPLE">نمونه دارویی</option>
            <option value="GIFT">هدیه تبلیغاتی</option>
          </select>
        </td>
        <td className="px-4 py-2">
          <input
            className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-brand"
            value={form.unit_label}
            onChange={(e) => setForm((f) => ({ ...f, unit_label: e.target.value }))}
          />
        </td>
        <td className="px-4 py-2.5 text-left">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "..." : "ذخیره"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm({ name: product.name, type: product.type, unit_label: product.unit_label });
                setError("");
              }}
              className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-100"
            >
              انصراف
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-neutral-100">
      <td className="px-4 py-2.5 text-neutral-800">{product.name}</td>
      <td className="px-4 py-2.5 text-neutral-500">{product.type === "SAMPLE" ? "نمونه دارویی" : "هدیه تبلیغاتی"}</td>
      <td className="px-4 py-2.5 text-neutral-500">{product.unit_label}</td>
      <td className="px-4 py-2.5 text-left">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-brand-dark hover:underline"
          >
            ✏️ ویرایش
          </button>
          <DeleteButton url={`/api/products/${product.id}`} confirmLabel="این محصول حذف شود؟" label="🗑️" />
        </div>
      </td>
    </tr>
  );
}
