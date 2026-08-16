import { overviewCounts, repPerformance, sampleConsumption, visitsForMap } from "@/lib/repo/dashboard";
import VisitsMapLoader from "@/components/VisitsMapLoader";

type Overview = {
  doctor_count: number;
  rep_count: number;
  visits_this_week: number;
  visits_today: number;
  active_visits: number;
};

type RepRow = {
  id: number;
  name: string;
  region: string | null;
  monthly_target: number;
  visits_this_month: number;
  visits_today: number;
};

type SampleRow = { name: string; type: string; unit_label: string; total_qty: number; visit_count: number };

function StatTile({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ?? "text-neutral-900"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const [overviewRaw, repsRaw, samplesRaw, mapVisitsRaw] = await Promise.all([
    overviewCounts(),
    repPerformance(),
    sampleConsumption(30),
    visitsForMap(14),
  ]);
  const overview = overviewRaw as Overview;
  const reps = repsRaw as RepRow[];
  const samples = samplesRaw as SampleRow[];
  // node:sqlite row objects aren't plain objects (they fail the RSC
  // serialization boundary), so re-map to plain literals before handing
  // them to the client-side map component.
  const mapVisits = (
    mapVisitsRaw as {
      id: number;
      lat: number;
      lng: number;
      checkin_at: string;
      outcome: string | null;
      doctor_name: string;
      rep_name: string;
    }[]
  ).map((v) => ({
    id: v.id,
    lat: v.lat,
    lng: v.lng,
    checkin_at: v.checkin_at,
    outcome: v.outcome,
    doctor_name: v.doctor_name,
    rep_name: v.rep_name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">نمای کلی</h1>
        <p className="text-sm text-neutral-500">وضعیت زنده تیم فروش و ویزیت پزشکان</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="ویزیت امروز" value={overview.visits_today} accent="text-brand" />
        <StatTile label="ویزیت این هفته" value={overview.visits_this_week} />
        <StatTile label="ویزیت‌های در حال انجام" value={overview.active_visits} accent="text-accent" />
        <StatTile label="تعداد پزشکان" value={overview.doctor_count} />
        <StatTile label="تعداد ویزیتورها" value={overview.rep_count} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-3">
          <div className="border-b border-neutral-100 p-4">
            <h2 className="font-bold text-neutral-900">عملکرد ویزیتورها در برابر هدف</h2>
            <p className="text-xs text-neutral-500">تعداد ویزیت از ابتدای ماه جاری</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
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
              {reps.map((r) => {
                const pct = r.monthly_target > 0 ? Math.min(100, Math.round((r.visits_this_month / r.monthly_target) * 100)) : 0;
                return (
                  <tr key={r.id} className="border-t border-neutral-100">
                    <td className="px-4 py-2.5 font-medium text-neutral-800">{r.name}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{r.region ?? "—"}</td>
                    <td className="px-4 py-2.5">{r.visits_today}</td>
                    <td className="px-4 py-2.5">{r.visits_this_month}</td>
                    <td className="px-4 py-2.5">{r.monthly_target}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-100">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
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

        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-neutral-100 p-4">
            <h2 className="font-bold text-neutral-900">مصرف نمونه دارویی (۳۰ روز اخیر)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-2 text-right font-medium">محصول</th>
                <th className="px-4 py-2 text-right font-medium">مقدار</th>
                <th className="px-4 py-2 text-right font-medium">تعداد ویزیت</th>
              </tr>
            </thead>
            <tbody>
              {samples.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                    داده‌ای ثبت نشده است.
                  </td>
                </tr>
              )}
              {samples.map((s) => (
                <tr key={s.name} className="border-t border-neutral-100">
                  <td className="px-4 py-2.5 text-neutral-800">
                    {s.name}
                    <span className="mr-1 text-xs text-neutral-400">({s.type === "SAMPLE" ? "نمونه" : "هدیه"})</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {s.total_qty} {s.unit_label}
                  </td>
                  <td className="px-4 py-2.5">{s.visit_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <div>
            <h2 className="font-bold text-neutral-900">نقشه پراکندگی بازدیدها (۱۴ روز اخیر)</h2>
            <p className="text-xs text-neutral-500">رنگ نقطه بیانگر نتیجه ویزیت است</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#1f7a4d]" /> مثبت</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#2f6fb0]" /> پیگیری</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#c98a3e]" /> خنثی</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[#c0392b]" /> منفی</span>
          </div>
        </div>
        <div className="p-2">
          <VisitsMapLoader visits={mapVisits} />
        </div>
      </div>
    </div>
  );
}
