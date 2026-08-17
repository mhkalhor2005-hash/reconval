import Link from "next/link";
import { planStatusForWeek, weekStartISO, shiftWeek, weekEndISO } from "@/lib/repo/plans";
import { listDoctors } from "@/lib/repo/doctors";
import PlanEditor from "@/components/PlanEditor";

function formatFa(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("fa-IR");
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : weekStartISO(new Date());
  const weekEnd = weekEndISO(weekStart);
  const prevWeek = shiftWeek(weekStart, -1);
  const nextWeek = shiftWeek(weekStart, 1);
  const thisWeek = weekStartISO(new Date());

  const [status, doctors] = await Promise.all([planStatusForWeek(weekStart), listDoctors()]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">برنامه هفتگی ویزیت</h1>
        <p className="text-sm text-neutral-500">شنبه تا جمعه — انتخاب پزشکان هر ویزیتور برای این هفته</p>
      </div>

      <div className="card flex items-center justify-between p-3">
        <Link
          href={`/dashboard/plans?week=${prevWeek}`}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
        >
          ◀ هفته قبل
        </Link>
        <div className="text-center">
          <p className="text-sm font-bold text-neutral-900">
            {formatFa(weekStart)} تا {formatFa(weekEnd)}
          </p>
          {weekStart === thisWeek && <p className="text-xs text-brand-dark">هفته جاری</p>}
        </div>
        <Link
          href={`/dashboard/plans?week=${nextWeek}`}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
        >
          هفته بعد ▶
        </Link>
      </div>

      <div className="space-y-3">
        {status.length === 0 && (
          <div className="card p-6 text-center text-sm text-neutral-400">ابتدا یک ویزیتور ثبت کنید.</div>
        )}
        {status.map((rep) => (
          <div key={rep.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold text-neutral-900">{rep.name}</h3>
              <span className="text-xs text-neutral-400">{rep.region ?? "—"}</span>
            </div>
            <PlanEditor
              repId={rep.id}
              weekStart={weekStart}
              allDoctors={doctors.map((d) => ({ id: d.id, name: d.name }))}
              items={rep.items.map((it) => ({
                id: it.id,
                doctor_id: it.doctor_id,
                doctor_name: it.doctor_name,
                done: it.done,
                outcome: it.outcome,
                note: it.note,
                completed_at: it.completed_at,
              }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
