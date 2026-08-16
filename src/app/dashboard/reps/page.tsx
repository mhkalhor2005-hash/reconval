import Link from "next/link";
import { repPerformance } from "@/lib/repo/dashboard";

type RepRow = {
  id: number;
  name: string;
  region: string | null;
  monthly_target: number;
  visits_this_month: number;
  visits_today: number;
};

export default async function RepsPage() {
  const reps = repPerformance() as RepRow[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">ویزیتورهای تیم</h1>
        <p className="text-sm text-neutral-500">{reps.length} نفر</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reps.map((r) => {
          const pct = r.monthly_target > 0 ? Math.min(100, Math.round((r.visits_this_month / r.monthly_target) * 100)) : 0;
          return (
            <Link key={r.id} href={`/dashboard/reps/${r.id}`} className="card block p-4 transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">{r.name}</h3>
                <span className="text-xs text-neutral-400">{r.region ?? "—"}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-neutral-500">{pct}٪</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {r.visits_this_month} از {r.monthly_target} ویزیت ماهانه · {r.visits_today} ویزیت امروز
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
