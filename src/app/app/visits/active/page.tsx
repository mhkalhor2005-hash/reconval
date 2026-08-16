"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActiveLocal, clearActiveLocal, queueVisit, syncPending, type ActiveLocalVisit } from "@/lib/offlineQueue";

type Product = { id: number; name: string; type: "SAMPLE" | "GIFT"; unit_label: string };
type InventoryRow = { product_id: number; qty_on_hand: number };

type ActiveVisit =
  | { mode: "online"; id: number; doctorName: string; checkinAt: string }
  | { mode: "offline"; local: ActiveLocalVisit }
  | { mode: "none" };

const OUTCOMES: { value: string; label: string }[] = [
  { value: "POSITIVE", label: "مثبت 🙂" },
  { value: "NEUTRAL", label: "خنثی 😐" },
  { value: "FOLLOW_UP", label: "نیاز به پیگیری 🔁" },
  { value: "NEGATIVE", label: "منفی 🙁" },
];

export default function ActiveVisitPage() {
  const router = useRouter();
  const [active, setActive] = useState<ActiveVisit | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [outcome, setOutcome] = useState("POSITIVE");
  const [note, setNote] = useState("");
  const [qtyByProduct, setQtyByProduct] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const local = getActiveLocal();
    if (local) {
      setActive({ mode: "offline", local });
    } else {
      fetch("/api/visits/active")
        .then((r) => r.json())
        .then((v) => {
          if (v) setActive({ mode: "online", id: v.id, doctorName: v.doctor_name, checkinAt: v.checkin_at });
          else setActive({ mode: "none" });
        })
        .catch(() => setActive({ mode: "none" }));
    }

    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setInventory)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stockFor(productId: number) {
    return inventory.find((i) => i.product_id === productId)?.qty_on_hand ?? 0;
  }

  function setQty(productId: number, qty: number) {
    const max = stockFor(productId);
    const clamped = Math.max(0, Math.min(qty, max));
    setQtyByProduct((s) => ({ ...s, [productId]: clamped }));
  }

  async function onSubmit() {
    if (!active || active.mode === "none") return;
    setSaving(true);
    setError("");
    const deliveries = Object.entries(qtyByProduct)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId: Number(productId), qty }));

    if (active.mode === "online") {
      try {
        const res = await fetch(`/api/visits/${active.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outcome, note, deliveries }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "خطا در ثبت پایان ویزیت.");
        }
        router.push("/app/visits");
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setSaving(false);
      }
      return;
    }

    // offline mode
    const productMap = new Map(products.map((p) => [p.id, p]));
    queueVisit({
      clientUuid: active.local.clientUuid,
      doctorId: active.local.doctorId,
      doctorName: active.local.doctorName,
      checkinAt: active.local.checkinAt,
      checkoutAt: new Date().toISOString(),
      lat: active.local.lat,
      lng: active.local.lng,
      outcome,
      note,
      deliveries: deliveries.map((d) => ({
        productId: d.productId,
        qty: d.qty,
        productName: productMap.get(d.productId)?.name ?? "",
      })),
    });
    clearActiveLocal();
    syncPending();
    setSaving(false);
    router.push("/app/visits");
  }

  if (active === null) {
    return <p className="p-6 text-center text-sm text-neutral-400">در حال بارگذاری...</p>;
  }

  if (active.mode === "none") {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-neutral-500">در حال حاضر ویزیت بازی وجود ندارد.</p>
        <button onClick={() => router.push("/app/doctors")} className="mt-3 text-sm font-semibold text-brand-dark">
          رفتن به فهرست پزشکان →
        </button>
      </div>
    );
  }

  const doctorName = active.mode === "online" ? active.doctorName : active.local.doctorName;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <p className="text-xs text-neutral-400">ویزیت جاری {active.mode === "offline" && "(آفلاین)"}</p>
        <h1 className="text-lg font-bold text-neutral-900">{doctorName}</h1>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-semibold text-neutral-700">نتیجه ویزیت</p>
        <div className="grid grid-cols-2 gap-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setOutcome(o.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                outcome === o.value ? "border-brand bg-brand-light text-brand-dark" : "border-neutral-300 text-neutral-600"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-semibold text-neutral-700">یادداشت</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
          placeholder="خلاصه گفتگو، درخواست پزشک و..."
        />
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-semibold text-neutral-700">تحویل نمونه دارویی / هدیه</p>
        <div className="space-y-2">
          {products.map((p) => {
            const stock = stockFor(p.id);
            const qty = qtyByProduct[p.id] ?? 0;
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                <div>
                  <p className="text-sm text-neutral-800">{p.name}</p>
                  <p className="text-[11px] text-neutral-400">موجودی شما: {stock} {p.unit_label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty - 1)}
                    className="h-7 w-7 rounded-full border border-neutral-300 text-neutral-600"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty + 1)}
                    disabled={qty >= stock}
                    className="h-7 w-7 rounded-full border border-neutral-300 text-neutral-600 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={saving}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {saving ? "در حال ثبت..." : "■ پایان ویزیت و ثبت"}
      </button>
    </div>
  );
}
