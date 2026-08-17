import Link from "next/link";
import { notFound } from "next/navigation";
import { getRep } from "@/lib/repo/users";
import { recentVisitsForRep, OUTCOME_LABELS, type Outcome } from "@/lib/repo/plans";
import DeleteButton from "@/components/DeleteButton";

export default async function RepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rep = await getRep(Number(id));
  if (!rep || rep.role !== "REP") notFound();

  const visits = (await recentVisitsForRep(Number(id), 20)) as {
    id: number;
    done: number;
    outcome: Outcome | null;
    note: string | null;
    completed_at: string | null;
    doctor_name: string;
  }[];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card flex items-start justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{rep.name}</h1>
          <p className="text-sm text-neutral-500">
            منطقه: {rep.region ?? "—"} · هدف ماهانه: {rep.monthly_target} ویزیت · نام کاربری: {rep.username}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/dashboard/plans?rep=${id}`}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
          >
            📅 برنامه هفتگی
          </Link>
          <Link
            href={`/dashboard/reps/${id}/edit`}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
          >
            ✏️ ویرایش
          </Link>
          <DeleteButton
            url={`/api/reps/${id}`}
            confirmLabel="این ویزیتور غیرفعال شود؟"
            redirectTo="/dashboard/reps"
            label="🗑️ حذف ویزیتور"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">ویزیت‌های اخیر</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">پزشک</th>
              <th className="px-4 py-2 text-right font-medium">وضعیت</th>
              <th className="px-4 py-2 text-right font-medium">تاریخ</th>
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  ویزیتی ثبت نشده است.
                </td>
              </tr>
            )}
            {visits.map((v) => (
              <tr key={v.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-800">{v.doctor_name}</td>
                <td className="px-4 py-2.5">
                  {v.done ? (v.outcome ? OUTCOME_LABELS[v.outcome] : "—") : "برنامه‌ریزی‌شده"}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">
                  {v.completed_at ? new Date(v.completed_at).toLocaleString("fa-IR") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
