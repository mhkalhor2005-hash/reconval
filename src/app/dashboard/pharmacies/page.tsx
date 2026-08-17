import Link from "next/link";
import { listPharmacies } from "@/lib/repo/pharmacies";
import { formatJalaliDate } from "@/lib/date";
import PharmacyForm from "@/components/PharmacyForm";

function orderRecencyClass(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 30) return "bg-green-50 text-green-700";
  if (days <= 60) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

export default async function PharmaciesPage() {
  const pharmacies = (await listPharmacies()) as {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    last_order_date: string | null;
    last_order_qty: number | null;
    last_order_rep: string | null;
  }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-lg">💊</div>
        <div>
          <h1 className="text-xl font-bold text-ink">داروخانه‌ها</h1>
          <p className="text-sm text-neutral-500">{pharmacies.length} داروخانه ثبت‌شده</p>
        </div>
      </div>

      <div className="card p-4">
        <PharmacyForm />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-brand-light/70 p-4">
          <h2 className="font-bold text-ink">فهرست داروخانه‌ها</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-light/40 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">نام</th>
              <th className="px-4 py-2 text-right font-medium">آدرس</th>
              <th className="px-4 py-2 text-right font-medium">آخرین سفارش</th>
              <th className="px-4 py-2 text-right font-medium">تعداد</th>
              <th className="px-4 py-2 text-right font-medium">ثبت توسط</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  داروخانه‌ای ثبت نشده است.
                </td>
              </tr>
            )}
            {pharmacies.map((p) => (
              <tr key={p.id} className="border-t border-brand-light/60 transition hover:bg-brand-light/20">
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/pharmacies/${p.id}`} className="font-medium text-brand-dark hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{p.address || "—"}</td>
                <td className="px-4 py-2.5">
                  {p.last_order_date ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${orderRecencyClass(p.last_order_date)}`}
                    >
                      📦 {formatJalaliDate(p.last_order_date)}
                    </span>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{p.last_order_qty ?? "—"}</td>
                <td className="px-4 py-2.5 text-neutral-500">{p.last_order_rep ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
