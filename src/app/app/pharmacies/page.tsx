import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listPharmacies } from "@/lib/repo/pharmacies";

function orderRecencyClass(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 30) return "bg-green-50 text-green-700";
  if (days <= 60) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export default async function RepPharmaciesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const pharmacies = (await listPharmacies()) as {
    id: number;
    name: string;
    address: string | null;
    last_order_date: string | null;
    last_order_qty: number | null;
    last_order_rep: string | null;
  }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-base">💊</div>
        <h1 className="text-lg font-bold text-ink">داروخانه‌ها</h1>
      </div>
      <div className="space-y-2">
        {pharmacies.length === 0 && <p className="card p-4 text-center text-sm text-neutral-400">داروخانه‌ای ثبت نشده است.</p>}
        {pharmacies.map((p) => (
          <Link key={p.id} href={`/app/pharmacies/${p.id}`} className="card card-hover block p-4">
            <p className="font-medium text-ink">{p.name}</p>
            <p className="text-xs text-neutral-500">{p.address || ""}</p>
            <div className="mt-1.5">
              {p.last_order_date ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${orderRecencyClass(p.last_order_date)}`}
                >
                  📦 {new Date(p.last_order_date).toLocaleDateString("fa-IR")} · {p.last_order_qty} عدد
                </span>
              ) : (
                <span className="text-xs text-neutral-400">بدون سفارش ثبت‌شده</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
