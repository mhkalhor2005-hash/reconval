import { getSessionUser } from "@/lib/auth";
import { recentVisitsForRep, OUTCOME_LABELS, type Outcome } from "@/lib/repo/plans";
import { formatJalaliDateTime } from "@/lib/date";
import { redirect } from "next/navigation";

const OUTCOME_BADGE: Record<Outcome, string> = {
  POSITIVE: "bg-green-50 text-green-700",
  NEUTRAL: "bg-neutral-100 text-neutral-600",
  FOLLOW_UP: "bg-amber-50 text-amber-700",
  NEGATIVE: "bg-red-50 text-red-700",
};

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
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-lg">✅</div>
        <h1 className="text-lg font-bold text-ink">ویزیت‌های من</h1>
      </div>
      <ul className="space-y-2">
        {visits.length === 0 && <li className="card p-4 text-center text-sm text-neutral-400">هنوز ویزیتی ثبت نکرده‌اید.</li>}
        {visits.map((v) => (
          <li key={v.id} className={`card p-4 ${v.done ? "bg-brand-light/20" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">
                {v.done && <span className="ml-1 text-brand-dark">✓</span>}
                {v.doctor_name}
              </span>
              {!v.done ? (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">برنامه‌ریزی‌شده</span>
              ) : v.outcome ? (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_BADGE[v.outcome]}`}>
                  {OUTCOME_LABELS[v.outcome]}
                </span>
              ) : (
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">—</span>
              )}
            </div>
            {v.completed_at && (
              <p className="mt-1 text-xs text-neutral-500">{formatJalaliDateTime(v.completed_at)}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
