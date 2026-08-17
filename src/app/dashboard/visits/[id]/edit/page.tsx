import { notFound } from "next/navigation";
import { getVisit } from "@/lib/repo/plans";
import EditVisitForm from "@/components/EditVisitForm";

export default async function EditVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = (await getVisit(Number(id))) as
    | { id: number; doctor_id: number; doctor_name: string; outcome: string | null; note: string | null }
    | undefined;
  if (!raw) notFound();
  const visit = {
    id: raw.id,
    doctor_id: raw.doctor_id,
    doctor_name: raw.doctor_name,
    outcome: raw.outcome,
    note: raw.note,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-lg">📝</div>
        <div>
          <h1 className="text-xl font-bold text-ink">ویرایش نتیجه ویزیت</h1>
          <p className="text-sm text-neutral-500">{visit.doctor_name}</p>
        </div>
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
