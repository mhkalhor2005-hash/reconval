import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { repPerformance } from "@/lib/repo/dashboard";
import ProductStrip from "@/components/ProductStrip";

export default async function RepHomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const allReps = (await repPerformance()) as {
    id: number;
    visits_today: number;
    visits_this_month: number;
    monthly_target: number;
  }[];
  const mine = allReps.find((r) => r.id === user.id);
  const pct = mine && mine.monthly_target > 0 ? Math.min(100, Math.round((mine.visits_this_month / mine.monthly_target) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-4 text-white shadow-lg shadow-brand/20">
        <div className="ribbon-watermark opacity-30" />
        <h1 className="relative z-10 text-lg font-bold">سلام {user.name.split(" ")[0]} 👋</h1>
        <p className="relative z-10 text-sm text-white/80">امروز روز خوبی برای ویزیت است.</p>
      </div>

      {mine && (
        <div className="card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">پیشرفت هدف ماهانه</span>
            <span className="font-semibold text-ink">
              {mine.visits_this_month} از {mine.monthly_target}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-light">
            <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-neutral-400">{mine.visits_today} ویزیت امروز</p>
        </div>
      )}

      <Link
        href="/app/plan"
        className="block rounded-xl bg-brand-gradient p-4 text-center font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90"
      >
        📅 برنامه هفتگی من
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/app/doctors" className="card card-hover p-4 text-center">
          <p className="text-2xl">🩺</p>
          <p className="mt-1 text-sm font-medium text-neutral-700">پزشکان</p>
        </Link>
        <Link href="/app/pharmacies" className="card card-hover p-4 text-center">
          <p className="text-2xl">💊</p>
          <p className="mt-1 text-sm font-medium text-neutral-700">داروخانه‌ها</p>
        </Link>
      </div>

      <ProductStrip />
    </div>
  );
}
