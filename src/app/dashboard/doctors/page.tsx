import Link from "next/link";
import { listDoctors } from "@/lib/repo/doctors";

const FACILITY_LABEL: Record<string, string> = {
  CLINIC: "کلینیک",
  HOSPITAL: "بیمارستان",
  OFFICE: "مطب",
  PHARMACY: "داروخانه",
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const doctors = listDoctors(q);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">پزشکان و مراکز درمانی</h1>
          <p className="text-sm text-neutral-500">{doctors.length} پزشک/مرکز ثبت‌شده</p>
        </div>
        <Link
          href="/dashboard/doctors/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + افزودن پزشک جدید
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="جستجوی نام، تخصص یا آدرس..."
          className="w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100">جستجو</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">نام</th>
              <th className="px-4 py-2 text-right font-medium">تخصص</th>
              <th className="px-4 py-2 text-right font-medium">نوع مرکز</th>
              <th className="px-4 py-2 text-right font-medium">آدرس</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  پزشکی یافت نشد.
                </td>
              </tr>
            )}
            {doctors.map((d) => (
              <tr key={d.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/doctors/${d.id}`} className="font-medium text-brand-dark hover:underline">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">{d.specialty ?? "—"}</td>
                <td className="px-4 py-2.5 text-neutral-600">{FACILITY_LABEL[d.facility_type] ?? d.facility_type}</td>
                <td className="px-4 py-2.5 text-neutral-500">{d.address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
