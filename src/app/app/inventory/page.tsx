import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listRepInventory } from "@/lib/repo/inventory";

export default async function MyInventoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const inventory = (await listRepInventory(user.id)) as {
    id: number;
    product_id: number;
    qty_on_hand: number;
    name: string;
    type: "SAMPLE" | "GIFT";
    unit_label: string;
  }[];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-neutral-900">موجودی من</h1>
      <div className="space-y-2">
        {inventory.map((i) => (
          <div key={i.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-neutral-900">{i.name}</p>
              <p className="text-xs text-neutral-400">{i.type === "SAMPLE" ? "نمونه دارویی" : "هدیه تبلیغاتی"}</p>
            </div>
            <span className={`text-lg font-extrabold ${i.qty_on_hand < 10 ? "text-red-600" : "text-brand-dark"}`}>
              {i.qty_on_hand} <span className="text-xs font-normal text-neutral-400">{i.unit_label}</span>
            </span>
          </div>
        ))}
        {inventory.length === 0 && <p className="card p-4 text-center text-sm text-neutral-400">موجودی ثبت نشده است.</p>}
      </div>
    </div>
  );
}
