import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctor, doctorVisitHistory } from "@/lib/repo/doctors";
import { OUTCOME_LABELS, type Outcome } from "@/lib/repo/visits";

const FACILITY_LABEL: Record<string, string> = {
  CLINIC: "کلینیک",
  HOSPITAL: "بیمارستان",
  OFFICE: "مطب",
  PHARMACY: "داروخانه",
};

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = getDoctor(Number(id));
  if (!doctor) notFound();
  const history = doctorVisitHistory(Number(id)) as {
    id: number;
    checkin_at: string;
    checkout_at: string | null;
    outcome: Outcome | null;
    note: string | null;
    rep_name: string;
  }[];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{doctor.name}</h1>
            <p className="text-sm text-neutral-500">{doctor.specialty || "—"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
              {FACILITY_LABEL[doctor.facility_type] ?? doctor.facility_type}
            </span>
            <Link
              href={`/dashboard/doctors/${id}/edit`}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
            >
              ✏️ ویرایش
            </Link>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-400">آدرس</dt>
            <dd className="text-neutral-800">{doctor.address || "—"}</dd>
          </div>
          <div>
            <dt className="text-neutral-400">تلفن</dt>
            <dd dir="ltr" className="text-left text-neutral-800">
              {doctor.phone || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">موقعیت مکانی</dt>
            <dd className="text-neutral-800">
              {doctor.lat && doctor.lng ? `${doctor.lat.toFixed(5)}, ${doctor.lng.toFixed(5)}` : "ثبت نشده"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-400">یادداشت</dt>
            <dd className="text-neutral-800">{doctor.notes || "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-4">
          <h2 className="font-bold text-neutral-900">تاریخچه تعاملات ({history.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-2 text-right font-medium">تاریخ</th>
              <th className="px-4 py-2 text-right font-medium">ویزیتور</th>
              <th className="px-4 py-2 text-right font-medium">نتیجه</th>
              <th className="px-4 py-2 text-right font-medium">یادداشت</th>
              <th className="px-4 py-2 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  هنوز ویزیتی ثبت نشده است.
                </td>
              </tr>
            )}
            {history.map((h) => (
              <tr key={h.id} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 text-neutral-600">{new Date(h.checkin_at).toLocaleString("fa-IR")}</td>
                <td className="px-4 py-2.5 text-neutral-800">{h.rep_name}</td>
                <td className="px-4 py-2.5">{h.outcome ? OUTCOME_LABELS[h.outcome] : "در حال انجام"}</td>
                <td className="px-4 py-2.5 text-neutral-500">{h.note || "—"}</td>
                <td className="px-4 py-2.5 text-left">
                  <Link href={`/dashboard/visits/${h.id}/edit`} className="text-xs font-medium text-brand-dark hover:underline">
                    ✏️ ویرایش
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
