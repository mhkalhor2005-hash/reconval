import { listProducts } from "@/lib/repo/products";
import { inventorySummaryAllReps } from "@/lib/repo/inventory";
import NewProductForm from "@/components/NewProductForm";

export default async function ProductsPage() {
  const products = await listProducts();
  const inventory = (await inventorySummaryAllReps()) as {
    rep_id: number;
    rep_name: string;
    product_name: string;
    type: string;
    qty_on_hand: number;
  }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">کاتالوگ نمونه دارویی و هدایا</h1>
        <p className="text-sm text-neutral-500">{products.length} قلم کالا</p>
      </div>

      <div className="card p-4">
        <NewProductForm />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">فهرست محصولات</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">نام</th>
              <th className="px-4 py-2 text-right font-medium">نوع</th>
              <th className="px-4 py-2 text-right font-medium">واحد</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-800">{p.name}</td>
                <td className="px-4 py-2.5 text-neutral-500">{p.type === "SAMPLE" ? "نمونه دارویی" : "هدیه تبلیغاتی"}</td>
                <td className="px-4 py-2.5 text-neutral-500">{p.unit_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">موجودی به تفکیک ویزیتور</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">محصول</th>
              <th className="px-4 py-2 text-right font-medium">موجودی</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i, idx) => (
              <tr key={idx} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-800">{i.rep_name}</td>
                <td className="px-4 py-2.5 text-neutral-600">{i.product_name}</td>
                <td className={`px-4 py-2.5 font-medium ${i.qty_on_hand < 10 ? "text-red-600" : "text-neutral-800"}`}>
                  {i.qty_on_hand}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
