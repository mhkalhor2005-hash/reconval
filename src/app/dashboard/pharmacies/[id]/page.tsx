import { notFound } from "next/navigation";
import { getPharmacy, listPharmacyOrders } from "@/lib/repo/pharmacies";
import PharmacyForm from "@/components/PharmacyForm";
import OrderForm from "@/components/OrderForm";
import DeleteButton from "@/components/DeleteButton";

export default async function PharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pharmacy = await getPharmacy(Number(id));
  if (!pharmacy) notFound();
  const orders = (await listPharmacyOrders(Number(id))) as {
    id: number;
    order_date: string;
    quantity: number;
    note: string | null;
    rep_name: string;
  }[];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-lg">💊</div>
            <h1 className="text-xl font-bold text-ink">{pharmacy.name}</h1>
          </div>
          <DeleteButton
            url={`/api/pharmacies/${id}`}
            confirmLabel="این داروخانه حذف شود؟"
            redirectTo="/dashboard/pharmacies"
            label="🗑️ حذف داروخانه"
          />
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 font-bold text-ink">ویرایش اطلاعات</h2>
        <PharmacyForm
          initial={{
            id: pharmacy.id,
            name: pharmacy.name,
            address: pharmacy.address,
            phone: pharmacy.phone,
            notes: pharmacy.notes,
          }}
        />
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-light text-base">📦</div>
          <h2 className="font-bold text-ink">ثبت سفارش جدید</h2>
        </div>
        <OrderForm pharmacyId={pharmacy.id} />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-brand-light/70 p-4">
          <h2 className="font-bold text-ink">تاریخچه سفارش‌ها</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-light/40 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">تاریخ</th>
              <th className="px-4 py-2 text-right font-medium">تعداد</th>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">یادداشت</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  سفارشی ثبت نشده است.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-brand-light/60 transition hover:bg-brand-light/20">
                <td className="px-4 py-2.5 text-neutral-800">{new Date(o.order_date).toLocaleDateString("fa-IR")}</td>
                <td className="px-4 py-2.5 text-neutral-800">{o.quantity}</td>
                <td className="px-4 py-2.5 text-neutral-600">{o.rep_name}</td>
                <td className="px-4 py-2.5 text-neutral-500">{o.note || "—"}</td>
                <td className="px-4 py-2.5 text-left">
                  <DeleteButton url={`/api/pharmacy-orders/${o.id}`} confirmLabel="این سفارش حذف شود؟" label="🗑️" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
