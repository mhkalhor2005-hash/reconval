import Link from "next/link";
import { listAllVisits, OUTCOME_LABELS, type Outcome } from "@/lib/repo/visits";

export default async function AllVisitsPage() {
  const visits = listAllVisits({ limit: 200 }) as {
    id: number;
    doctor_id: number;
    doctor_name: string;
    rep_name: string;
    checkin_at: string;
    checkout_at: string | null;
    outcome: Outcome | null;
    offline_created: number;
  }[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">همه ویزیت‌ها</h1>
        <p className="text-sm text-neutral-500">{visits.length} ویزیت اخیر</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">پزشک</th>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">زمان شروع</th>
              <th className="px-4 py-2 text-right font-medium">مدت (دقیقه)</th>
              <th className="px-4 py-2 text-right font-medium">نتیجه</th>
              <th className="px-4 py-2 text-right font-medium">منبع</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                  ویزیتی ثبت نشده است.
                </td>
              </tr>
            )}
            {visits.map((v) => {
              const durationMin = v.checkout_at
                ? Math.max(1, Math.round((new Date(v.checkout_at).getTime() - new Date(v.checkin_at).getTime()) / 60000))
                : null;
              return (
                <tr key={v.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2.5">
                    <Link href={`/dashboard/doctors/${v.doctor_id}`} className="font-medium text-brand-dark hover:underline">
                      {v.doctor_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-700">{v.rep_name}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{new Date(v.checkin_at).toLocaleString("fa-IR")}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{durationMin ?? "در حال انجام"}</td>
                  <td className="px-4 py-2.5">{v.outcome ? OUTCOME_LABELS[v.outcome] : "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-neutral-400">{v.offline_created ? "همگام‌سازی آفلاین" : "برخط"}</td>
                  <td className="px-4 py-2.5 text-left">
                    <Link href={`/dashboard/visits/${v.id}/edit`} className="text-xs font-medium text-brand-dark hover:underline">
                      ✏️ ویرایش
                    </Link>
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
