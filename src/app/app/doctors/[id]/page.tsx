import { notFound } from "next/navigation";
import { getDoctor, doctorVisitHistory } from "@/lib/repo/doctors";
import { OUTCOME_LABELS, type Outcome } from "@/lib/repo/visits";
import StartVisitButton from "@/components/StartVisitButton";

const FACILITY_LABEL: Record<string, string> = {
  CLINIC: "کلینیک",
  HOSPITAL: "بیمارستان",
  OFFICE: "مطب",
  PHARMACY: "داروخانه",
};

export default async function RepDoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(Number(id));
  if (!doctor) notFound();
  const history = (await doctorVisitHistory(Number(id))) as {
    id: number;
    checkin_at: string;
    outcome: Outcome | null;
    rep_name: string;
  }[];

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">{doctor.name}</h1>
            <p className="text-sm text-neutral-500">{doctor.specialty || "—"}</p>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
            {FACILITY_LABEL[doctor.facility_type] ?? doctor.facility_type}
          </span>
        </div>
        <div className="mt-3 space-y-1 text-sm text-neutral-600">
          <p>📍 {doctor.address || "آدرس ثبت نشده"}</p>
          {doctor.phone && (
            <p dir="ltr" className="text-left">
              ☎ {doctor.phone}
            </p>
          )}
          {doctor.notes && <p className="text-neutral-500">📝 {doctor.notes}</p>}
        </div>
      </div>

      <StartVisitButton doctorId={doctor.id} doctorName={doctor.name} />

      <div className="card overflow-hidden">
        <div className="border-b border-neutral-100 p-3">
          <h2 className="text-sm font-bold text-neutral-900">تاریخچه تعاملات</h2>
        </div>
        <ul className="divide-y divide-neutral-100">
          {history.length === 0 && <li className="p-4 text-center text-sm text-neutral-400">هنوز ویزیتی ثبت نشده.</li>}
          {history.map((h) => (
            <li key={h.id} className="flex items-center justify-between p-3 text-sm">
              <span className="text-neutral-500">{new Date(h.checkin_at).toLocaleDateString("fa-IR")}</span>
              <span className="text-neutral-500">{h.rep_name}</span>
              <span className="font-medium text-neutral-800">{h.outcome ? OUTCOME_LABELS[h.outcome] : "در حال انجام"}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
