import Link from "next/link";
import { overviewCounts, repPerformance } from "@/lib/repo/dashboard";

type Overview = {
  doctor_count: number;
  pharmacy_count: number;
  rep_count: number;
  visits_this_week: number;
  visits_today: number;
  pending_visits: number;
};

type RepRow = {
  id: number;
  name: string;
  region: string | null;
  monthly_target: number;
  visits_this_month: number;
  visits_today: number;
};

function StatTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: string;
}) {
  return (
    <div className="card card-hover p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-lg">{icon}</div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ?? "text-ink"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [overviewRaw, repsRaw] = await Promise.all([overviewCounts(), repPerformance()]);
  const overview = overviewRaw as Overview;
  const reps = repsRaw as RepRow[];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 text-white shadow-lg shadow-brand/20">
        <div className="ribbon-watermark opacity-40" />
        <h1 className="relative z-10 text-xl font-bold">نمای کلی</h1>
        <p className="relative z-10 text-sm text-white/80">وضعیت زنده تیم فروش و ویزیت پزشکان</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="ویزیت امروز" value={overview.visits_today} icon="📍" accent="text-brand" />
        <StatTile label="ویزیت این هفته" value={overview.visits_this_week} icon="🗓️" />
        <StatTile label="در انتظار انجام" value={overview.pending_visits} icon="⏳" accent="text-accent" />
        <StatTile label="تعداد پزشکان" value={overview.doctor_count} icon="🩺" />
        <StatTile label="تعداد داروخانه‌ها" value={overview.pharmacy_count} icon="💊" />
        <StatTile label="تعداد ویزیتورها" value={overview.rep_count} icon="🧑‍💼" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-brand-light/70 p-4">
          <div>
            <h2 className="font-bold text-ink">عملکرد ویزیتورها در برابر هدف</h2>
            <p className="text-xs text-neutral-500">تعداد ویزیت انجام‌شده از ابتدای ماه جاری</p>
          </div>
          <Link href="/dashboard/plans" className="text-xs font-medium text-brand-dark hover:underline">
            مدیریت برنامه هفتگی ↗
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-light/40 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">منطقه</th>
              <th className="px-4 py-2 text-right font-medium">امروز</th>
              <th className="px-4 py-2 text-right font-medium">این ماه</th>
              <th className="px-4 py-2 text-right font-medium">هدف ماهانه</th>
              <th className="px-4 py-2 text-right font-medium">پیشرفت</th>
            </tr>
          </thead>
          <tbody>
            {reps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  ویزیتوری ثبت نشده است.
                </td>
              </tr>
            )}
            {reps.map((r) => {
              const pct = r.monthly_target > 0 ? Math.min(100, Math.round((r.visits_this_month / r.monthly_target) * 100)) : 0;
              return (
                <tr key={r.id} className="border-t border-brand-light/60 transition hover:bg-brand-light/20">
                  <td className="px-4 py-2.5 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{r.region ?? "—"}</td>
                  <td className="px-4 py-2.5">{r.visits_today}</td>
                  <td className="px-4 py-2.5">{r.visits_this_month}</td>
                  <td className="px-4 py-2.5">{r.monthly_target}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-brand-light">
                        <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500">{pct}٪</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
