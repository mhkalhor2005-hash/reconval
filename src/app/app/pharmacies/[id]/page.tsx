import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getPharmacy, listPharmacyOrders } from "@/lib/repo/pharmacies";
import OrderForm from "@/components/OrderForm";

export default async function RepPharmacyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

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
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-lg font-bold text-neutral-900">{pharmacy.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">{pharmacy.address || "آدرس ثبت نشده"}</p>
        {pharmacy.phone && (
          <p dir="ltr" className="text-left text-sm text-neutral-500">
            ☎ {pharmacy.phone}
          </p>
        )}
      </div>

      <div className="card p-4">
        <h2 className="mb-3 text-sm font-bold text-neutral-900">ثبت سفارش جدید</h2>
        <OrderForm pharmacyId={pharmacy.id} />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-3">
          <h2 className="text-sm font-bold text-neutral-900">تاریخچه سفارش‌ها</h2>
        </div>
        <ul className="divide-y divide-neutral-100">
          {orders.length === 0 && <li className="p-4 text-center text-sm text-neutral-400">سفارشی ثبت نشده است.</li>}
          {orders.map((o) => (
            <li key={o.id} className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-800">{new Date(o.order_date).toLocaleDateString("fa-IR")}</span>
                <span className="text-neutral-600">{o.quantity} عدد</span>
              </div>
              <p className="text-xs text-neutral-400">{o.rep_name}{o.note ? ` · ${o.note}` : ""}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
