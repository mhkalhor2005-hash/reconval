import { notFound } from "next/navigation";
import { getRep } from "@/lib/repo/users";
import RepForm from "@/components/RepForm";

export default async function EditRepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rep = await getRep(Number(id));
  if (!rep || rep.role !== "REP") notFound();
  // node:sqlite rows aren't plain objects and can't cross the Server->Client
  // Component boundary as-is — remap to a plain literal first.
  const plainRep = {
    id: rep.id,
    name: rep.name,
    username: rep.username,
    region: rep.region,
    monthly_target: rep.monthly_target,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-ink">ویرایش ویزیتور</h1>
      <RepForm initial={plainRep} />
    </div>
  );
}
