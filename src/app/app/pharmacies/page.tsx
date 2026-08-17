import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listPharmacies } from "@/lib/repo/pharmacies";

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
      <h1 className="text-lg font-bold text-neutral-900">داروخانه‌ها</h1>
      <div className="space-y-2">
        {pharmacies.length === 0 && <p className="card p-4 text-center text-sm text-neutral-400">داروخانه‌ای ثبت نشده است.</p>}
        {pharmacies.map((p) => (
          <Link key={p.id} href={`/app/pharmacies/${p.id}`} className="card block p-4">
            <p className="font-medium text-neutral-900">{p.name}</p>
            <p className="text-xs text-neutral-500">{p.address || ""}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {p.last_order_date
                ? `آخرین سفارش: ${new Date(p.last_order_date).toLocaleDateString("fa-IR")} · ${p.last_order_qty} عدد`
                : "بدون سفارش ثبت‌شده"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
