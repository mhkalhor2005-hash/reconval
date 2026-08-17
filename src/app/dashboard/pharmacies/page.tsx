import Link from "next/link";
import { listPharmacies } from "@/lib/repo/pharmacies";
import PharmacyForm from "@/components/PharmacyForm";

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
      <div>
        <h1 className="text-xl font-bold text-neutral-900">داروخانه‌ها</h1>
        <p className="text-sm text-neutral-500">{pharmacies.length} داروخانه ثبت‌شده</p>
      </div>

      <div className="card p-4">
        <PharmacyForm />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">فهرست داروخانه‌ها</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
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
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/pharmacies/${p.id}`} className="font-medium text-brand-dark hover:underline">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{p.address || "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {p.last_order_date ? new Date(p.last_order_date).toLocaleDateString("fa-IR") : "—"}
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
