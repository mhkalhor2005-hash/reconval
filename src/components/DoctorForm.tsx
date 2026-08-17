"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FACILITY_OPTIONS = [
  { value: "OFFICE", label: "مطب" },
  { value: "CLINIC", label: "کلینیک" },
  { value: "HOSPITAL", label: "بیمارستان" },
  { value: "PHARMACY", label: "داروخانه" },
];

type DoctorInitial = {
  id: number;
  name: string;
  specialty: string | null;
  facility_type: string;
  address: string | null;
  phone: string | null;
  notes: string | null;
  lat: number | null;
  lng: number | null;
};

export default function DoctorForm({
  basePath,
  initial,
}: {
  basePath: "/dashboard" | "/app";
  initial?: DoctorInitial;
}) {
  const router = useRouter();
  const editing = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    specialty: initial?.specialty ?? "",
    facility_type: initial?.facility_type ?? "OFFICE",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    notes: initial?.notes ?? "",
    lat: (initial?.lat ?? "") as string | number,
    lng: (initial?.lng ?? "") as string | number,
  });
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setField("lat", pos.coords.latitude);
        setField("lng", pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("نام پزشک الزامی است.");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/doctors/${initial!.id}` : "/api/doctors";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        lat: form.lat === "" ? null : Number(form.lat),
        lng: form.lng === "" ? null : Number(form.lng),
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "خطا در ذخیره اطلاعات.");
      return;
    }
    const targetId = editing ? initial!.id : data.id;
    router.push(`${basePath}/doctors/${targetId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">نام پزشک / مرکز *</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">تخصص</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.specialty}
            onChange={(e) => setField("specialty", e.target.value)}
            placeholder="مثلاً متخصص قلب و عروق"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">نوع مرکز</label>
          <select
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.facility_type}
            onChange={(e) => setField("facility_type", e.target.value)}
          >
            {FACILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">شماره تماس</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            dir="ltr"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">آدرس</label>
          <input
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">یادداشت</label>
          <textarea
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand"
            rows={2}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-brand-light bg-brand-light/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-neutral-500">
            📍 موقعیت مکانی: {form.lat && form.lng ? `${Number(form.lat).toFixed(5)}, ${Number(form.lng).toFixed(5)}` : "ثبت نشده"}
          </p>
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-brand-light/40 disabled:opacity-50"
          >
            {locating ? "در حال دریافت موقعیت..." : "📍 استفاده از موقعیت فعلی"}
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-gradient py-2.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {saving ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ذخیره پزشک"}
      </button>
    </form>
  );
}
