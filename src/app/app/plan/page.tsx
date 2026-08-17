import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getPlanForRep, weekStartISO, shiftWeek, weekEndISO } from "@/lib/repo/plans";
import PlanVisitItem from "@/components/PlanVisitItem";

function formatFa(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("fa-IR");
}

export default async function MyPlanPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { week } = await searchParams;
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : weekStartISO(new Date());
  const weekEnd = weekEndISO(weekStart);
  const prevWeek = shiftWeek(weekStart, -1);
  const nextWeek = shiftWeek(weekStart, 1);
  const thisWeek = weekStartISO(new Date());

  const { items } = await getPlanForRep(user.id, weekStart);
  const typedItems = items as {
    id: number;
    doctor_id: number;
    doctor_name: string;
    specialty: string | null;
    address: string | null;
    phone: string | null;
    done: number;
    outcome: string | null;
    note: string | null;
    completed_at: string | null;
  }[];
  const doneCount = typedItems.filter((i) => i.done).length;
  const progressPct = typedItems.length > 0 ? Math.round((doneCount / typedItems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-lg">🗓️</div>
        <div>
          <h1 className="text-lg font-bold text-ink">برنامه هفتگی من</h1>
          <p className="text-sm text-neutral-500">
            {doneCount} از {typedItems.length} پزشک ویزیت شده
          </p>
        </div>
      </div>

      {typedItems.length > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-light">
          <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      <div className="card flex items-center justify-between p-3">
        <Link
          href={`/app/plan?week=${prevWeek}`}
          className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-brand-light/40"
        >
          ◀ قبل
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold text-ink">
            {formatFa(weekStart)} تا {formatFa(weekEnd)}
          </p>
          {weekStart === thisWeek && <p className="text-[10px] text-brand-dark">هفته جاری</p>}
        </div>
        <Link
          href={`/app/plan?week=${nextWeek}`}
          className="rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-brand-light/40"
        >
          بعد ▶
        </Link>
      </div>

      <div className="space-y-3">
        {typedItems.length === 0 && (
          <div className="card p-6 text-center text-sm text-neutral-400">برای این هفته پزشکی برایتان برنامه‌ریزی نشده است.</div>
        )}
        {typedItems.map((item) => (
          <PlanVisitItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
