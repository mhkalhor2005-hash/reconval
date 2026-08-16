import { notFound } from "next/navigation";
import { getVisit } from "@/lib/repo/visits";
import EditVisitForm from "@/components/EditVisitForm";

export default async function EditVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = getVisit(Number(id)) as
    | { id: number; doctor_id: number; doctor_name: string; rep_name: string; checkin_at: string; outcome: string | null; note: string | null }
    | undefined;
  if (!raw) notFound();
  // node:sqlite rows aren't plain objects and can't cross the Server->Client
  // Component boundary as-is — remap to plain literals first.
  const visit = {
    id: raw.id,
    doctor_id: raw.doctor_id,
    doctor_name: raw.doctor_name,
    rep_name: raw.rep_name,
    checkin_at: raw.checkin_at,
    outcome: raw.outcome,
    note: raw.note,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">ویرایش ویزیت</h1>
        <p className="text-sm text-neutral-500">
          {visit.doctor_name} · ویزیتور: {visit.rep_name} · {new Date(visit.checkin_at).toLocaleString("fa-IR")}
        </p>
      </div>
      <EditVisitForm
        visitId={visit.id}
        initialOutcome={visit.outcome}
        initialNote={visit.note}
        returnTo={`/dashboard/doctors/${visit.doctor_id}`}
      />
    </div>
  );
}
