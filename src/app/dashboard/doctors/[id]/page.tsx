import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctor } from "@/lib/repo/doctors";
import { doctorVisitHistory, OUTCOME_LABELS, type Outcome } from "@/lib/repo/plans";
import { formatJalaliDateTime } from "@/lib/date";
import DeleteButton from "@/components/DeleteButton";

const FACILITY_LABEL: Record<string, string> = {
  CLINIC: "کلینیک",
  HOSPITAL: "بیمارستان",
  OFFICE: "مطب",
  PHARMACY: "داروخانه",
};

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(Number(id));
  if (!doctor) notFound();
  const history = (await doctorVisitHistory(Number(id))) as {
    id: number;
    done: number;
    outcome: Outcome | null;
    note: string | null;
    completed_at: string | null;
    created_at: string;
    rep_name: string;
  }[];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-lg">🩺</div>
            <div>
              <h1 className="text-xl font-bold text-ink">{doctor.name}</h1>
              <p className="text-sm text-neutral-500">{doctor.specialty || "—"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
              {FACILITY_LABEL[doctor.facility_type] ?? doctor.facility_type}
            </span>
            <Link
              href={`/dashboard/doctors/${id}/edit`}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-brand-light/40"
            >
              ✏️ ویرایش
            </Link>
            <DeleteButton
              url={`/api/doctors/${id}`}
              confirmLabel="این پزشک حذف شود؟"
              redirectTo="/dashboard/doctors"
            />
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-400">📍 آدرس</dt>
            <dd className="text-neutral-800">{doctor.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">☎️ تلفن</dt>
            <dd dir="ltr" className="text-left text-neutral-800">
              {doctor.phone || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-neutral-400">📝 یادداشت (شامل خلاصه نتیجه ویزیت‌ها)</dt>
            <dd className="whitespace-pre-line text-neutral-800">{doctor.notes || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-brand-light/70 p-4">
          <h2 className="font-bold text-ink">تاریخچه ویزیت‌های برنامه‌ریزی‌شده ({history.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-light/40 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">وضعیت</th>
              <th className="px-4 py-2 text-right font-medium">تاریخ انجام</th>
              <th className="px-4 py-2 text-right font-medium">یادداشت</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  هنوز ویزیتی برای این پزشک برنامه‌ریزی نشده است.
                </td>
              </tr>
            )}
            {history.map((h) => (
              <tr key={h.id} className="border-t border-brand-light/60 transition hover:bg-brand-light/20">
                <td className="px-4 py-2.5 text-neutral-800">{h.rep_name}</td>
                <td className="px-4 py-2.5">
                  {h.done ? (h.outcome ? OUTCOME_LABELS[h.outcome] : "—") : "برنامه‌ریزی‌شده (هنوز انجام نشده)"}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {h.completed_at ? formatJalaliDateTime(h.completed_at) : "—"}
                </td>
                <td className="px-4 py-2.5 text-neutral-500">{h.note || "—"}</td>
                <td className="px-4 py-2.5 text-left">
                  <div className="flex items-center justify-end gap-2">
                    {h.done && (
                      <Link href={`/dashboard/visits/${h.id}/edit`} className="text-xs font-medium text-brand-dark hover:underline">
                        ✏️ ویرایش
                      </Link>
                    )}
                    <DeleteButton url={`/api/plan-visits/${h.id}`} confirmLabel="این مورد حذف شود؟" label="🗑️" />
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
