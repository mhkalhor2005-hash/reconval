import DoctorForm from "@/components/DoctorForm";

export default function NewDoctorRepPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-neutral-900">افزودن پزشک جدید</h1>
      <DoctorForm basePath="/app" />
    </div>
  );
}
