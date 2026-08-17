import Link from "next/link";
import { listCompletedVisits, OUTCOME_LABELS, type Outcome } from "@/lib/repo/plans";
import DeleteButton from "@/components/DeleteButton";

export default async function AllVisitsPage() {
  const visits = (await listCompletedVisits(200)) as {
    id: number;
    outcome: Outcome | null;
    note: string | null;
    completed_at: string | null;
    doctor_id: number;
    doctor_name: string;
    rep_name: string;
  }[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">تاریخچه ویزیت‌های انجام‌شده</h1>
        <p className="text-sm text-neutral-500">{visits.length} ویزیت انجام‌شده — بر اساس برنامه هفتگی</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">پزشک</th>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">تاریخ انجام</th>
              <th className="px-4 py-2 text-right font-medium">نتیجه</th>
              <th className="px-4 py-2 text-right font-medium">یادداشت</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  هنوز ویزیتی انجام نشده است.
                </td>
              </tr>
            )}
            {visits.map((v) => (
              <tr key={v.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/doctors/${v.doctor_id}`} className="font-medium text-brand-dark hover:underline">
                    {v.doctor_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-700">{v.rep_name}</td>
                <td className="px-4 py-2.5 text-neutral-500">
                  {v.completed_at ? new Date(v.completed_at).toLocaleString("fa-IR") : "—"}
                </td>
                <td className="px-4 py-2.5">{v.outcome ? OUTCOME_LABELS[v.outcome] : "—"}</td>
                <td className="px-4 py-2.5 text-neutral-500">{v.note || "—"}</td>
                <td className="px-4 py-2.5 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/visits/${v.id}/edit`} className="text-xs font-medium text-brand-dark hover:underline">
                      ✏️ ویرایش
                    </Link>
                    <DeleteButton url={`/api/plan-visits/${v.id}`} confirmLabel="این ویزیت حذف شود؟" label="🗑️" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
