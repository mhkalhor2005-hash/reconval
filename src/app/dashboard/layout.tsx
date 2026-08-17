import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import Logo from "@/components/Logo";
import RibbonIcon from "@/components/RibbonIcon";
import DashboardNavLink from "@/components/DashboardNavLink";
import ProductStrip from "@/components/ProductStrip";

const navItems = [
  { href: "/dashboard", label: "نمای کلی", icon: "📊" },
  { href: "/dashboard/doctors", label: "پزشکان", icon: "🩺" },
  { href: "/dashboard/reps", label: "ویزیتورها", icon: "🧑‍💼" },
  { href: "/dashboard/pharmacies", label: "داروخانه‌ها", icon: "💊" },
  { href: "/dashboard/plans", label: "برنامه هفتگی", icon: "📅" },
  { href: "/dashboard/visits", label: "تاریخچه ویزیت‌ها", icon: "📋" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER") redirect("/app");

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden border-l border-black/5 bg-ink sm:flex">
        <div className="ribbon-watermark opacity-60" />
        <div className="relative z-10 mb-6 px-5 pt-6">
          <Logo size="sm" dark />
        </div>
        <nav className="relative z-10 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <DashboardNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </nav>
        <div className="relative z-10 mx-3 mb-3">
          <ProductStrip dark />
        </div>

        <div className="relative z-10 mx-3 mb-4 rounded-xl bg-white/5 p-3">
          <p className="mb-2 text-[11px] leading-5 text-white/50">پنل ویزیتور را هم می‌خواهید ببینید؟</p>
          <Link
            href="/app"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white/90 transition hover:bg-white/20"
          >
            مشاهده نمای ویزیتور ↗
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-brand-light/70 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 sm:hidden">
            <RibbonIcon className="h-6 w-5" />
            <span className="font-display text-lg font-semibold text-ink">Reconval</span>
          </div>
          <div className="hidden text-sm text-neutral-500 sm:block">
            خوش آمدید، <span className="font-semibold text-ink">{user.name}</span>
          </div>
          <SignOutButton />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-brand-light/70 bg-white px-2 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-brand-light hover:text-brand-dark"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
