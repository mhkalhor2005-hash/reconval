import DoctorForm from "@/components/DoctorForm";

export default function NewDoctorPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-ink">افزودن پزشک جدید</h1>
      <DoctorForm basePath="/dashboard" />
    </div>
  );
}
