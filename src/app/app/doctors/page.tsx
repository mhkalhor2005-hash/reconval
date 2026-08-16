import Link from "next/link";
import { listDoctors } from "@/lib/repo/doctors";

export default async function RepDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const doctors = listDoctors(q);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">پزشکان</h1>
        <Link href="/app/doctors/new" className="text-sm font-semibold text-brand-dark">
          + پزشک جدید
        </Link>
      </div>

      <form>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="جستجو..."
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </form>

      <ul className="space-y-2">
        {doctors.length === 0 && <li className="card p-4 text-center text-sm text-neutral-400">پزشکی یافت نشد.</li>}
        {doctors.map((d) => (
          <li key={d.id}>
            <Link href={`/app/doctors/${d.id}`} className="card block p-4 transition active:bg-neutral-50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-900">{d.name}</span>
                <span className="text-xs text-neutral-400">{d.specialty}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">📍 {d.address || "آدرس ثبت نشده"}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
