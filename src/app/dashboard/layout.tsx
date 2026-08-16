import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "نمای کلی", icon: "📊" },
  { href: "/dashboard/doctors", label: "پزشکان", icon: "🩺" },
  { href: "/dashboard/reps", label: "ویزیتورها", icon: "🧑‍💼" },
  { href: "/dashboard/products", label: "نمونه و هدایا", icon: "💊" },
  { href: "/dashboard/visits", label: "همه ویزیت‌ها", icon: "📋" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "MANAGER") redirect("/app");

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-l border-neutral-200 bg-white p-4 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            ر
          </div>
          <span className="font-bold text-brand-dark">پنل مدیریت ریکنوال</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-brand-light hover:text-brand-dark"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link href="/app" className="mb-2 rounded-lg px-3 py-2 text-xs text-neutral-400 hover:text-neutral-600">
          مشاهده نمای ویزیتور ↗
        </Link>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
              ر
            </div>
            <span className="text-sm font-bold text-brand-dark">ریکنوال</span>
          </div>
          <div className="hidden text-sm text-neutral-500 sm:block">
            خوش آمدید، <span className="font-semibold text-neutral-800">{user.name}</span>
          </div>
          <SignOutButton />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white px-2 py-2 sm:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-brand-light"
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 bg-neutral-50 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
