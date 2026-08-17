import { getSessionUser } from "@/lib/auth";
import { recentVisitsForRep, OUTCOME_LABELS, type Outcome } from "@/lib/repo/plans";
import { redirect } from "next/navigation";

export default async function MyVisitsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const visits = (await recentVisitsForRep(user.id, 100)) as {
    id: number;
    done: number;
    outcome: Outcome | null;
    completed_at: string | null;
    doctor_name: string;
  }[];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-neutral-900">ویزیت‌های من</h1>
      <ul className="space-y-2">
        {visits.length === 0 && <li className="card p-4 text-center text-sm text-neutral-400">هنوز ویزیتی ثبت نکرده‌اید.</li>}
        {visits.map((v) => (
          <li key={v.id} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900">{v.doctor_name}</span>
              {!v.done ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">برنامه‌ریزی‌شده</span>
              ) : (
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                  {v.outcome ? OUTCOME_LABELS[v.outcome] : "—"}
                </span>
              )}
            </div>
            {v.completed_at && (
              <p className="mt-1 text-xs text-neutral-500">{new Date(v.completed_at).toLocaleString("fa-IR")}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
