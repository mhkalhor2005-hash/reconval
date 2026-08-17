import { notFound } from "next/navigation";
import { getDoctor } from "@/lib/repo/doctors";
import DoctorForm from "@/components/DoctorForm";

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doctor = await getDoctor(Number(id));
  if (!doctor) notFound();
  // node:sqlite rows aren't plain objects and can't cross the Server->Client
  // Component boundary as-is — remap to a plain literal first.
  const plainDoctor = {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    facility_type: doctor.facility_type,
    address: doctor.address,
    phone: doctor.phone,
    notes: doctor.notes,
    lat: doctor.lat,
    lng: doctor.lng,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-ink">ویرایش اطلاعات پزشک</h1>
      <DoctorForm basePath="/dashboard" initial={plainDoctor} />
    </div>
  );
}
