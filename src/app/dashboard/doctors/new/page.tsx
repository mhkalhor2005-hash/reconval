import DoctorForm from "@/components/DoctorForm";

export default function NewDoctorPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-neutral-900">افزودن پزشک جدید</h1>
      <DoctorForm basePath="/dashboard" />
    </div>
  );
}
