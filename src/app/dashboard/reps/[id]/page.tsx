import Link from "next/link";
import { notFound } from "next/navigation";
import { getRep } from "@/lib/repo/users";
import { listRepInventory } from "@/lib/repo/inventory";
import { listProducts } from "@/lib/repo/products";
import { listVisitsForRep } from "@/lib/repo/visits";
import { OUTCOME_LABELS, type Outcome } from "@/lib/repo/visits";
import AllocateStockForm from "@/components/AllocateStockForm";

export default async function RepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rep = getRep(Number(id));
  if (!rep || rep.role !== "REP") notFound();

  const inventory = listRepInventory(Number(id)) as {
    id: number;
    product_id: number;
    qty_on_hand: number;
    name: string;
    type: string;
    unit_label: string;
  }[];
  const products = listProducts();
  const visits = listVisitsForRep(Number(id), 15) as {
    id: number;
    doctor_name: string;
    checkin_at: string;
    checkout_at: string | null;
    outcome: Outcome | null;
  }[];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card flex items-start justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{rep.name}</h1>
          <p className="text-sm text-neutral-500">
            منطقه: {rep.region ?? "—"} · هدف ماهانه: {rep.monthly_target} ویزیت · نام کاربری: {rep.username}
          </p>
        </div>
        <Link
          href={`/dashboard/reps/${id}/edit`}
          className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
        >
          ✏️ ویرایش
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">موجودی نمونه دارویی و هدایا</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">محصول</th>
              <th className="px-4 py-2 text-right font-medium">نوع</th>
              <th className="px-4 py-2 text-right font-medium">موجودی فعلی</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-800">{i.name}</td>
                <td className="px-4 py-2.5 text-neutral-500">{i.type === "SAMPLE" ? "نمونه" : "هدیه"}</td>
                <td className={`px-4 py-2.5 font-semibold ${i.qty_on_hand < 10 ? "text-red-600" : "text-neutral-800"}`}>
                  {i.qty_on_hand} {i.unit_label}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-neutral-100 p-4">
          <p className="mb-2 text-xs font-medium text-neutral-500">تخصیص موجودی جدید:</p>
          <AllocateStockForm repId={Number(id)} products={products.map((p) => ({ id: p.id, name: p.name, unit_label: p.unit_label }))} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">ویزیت‌های اخیر</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">پزشک</th>
              <th className="px-4 py-2 text-right font-medium">تاریخ</th>
              <th className="px-4 py-2 text-right font-medium">نتیجه</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  ویزیتی ثبت نشده است.
                </td>
              </tr>
            )}
            {visits.map((v) => (
              <tr key={v.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-800">{v.doctor_name}</td>
                <td className="px-4 py-2.5 text-neutral-500">{new Date(v.checkin_at).toLocaleString("fa-IR")}</td>
                <td className="px-4 py-2.5">{v.outcome ? OUTCOME_LABELS[v.outcome] : "در حال انجام"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
