import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import RibbonIcon from "@/components/RibbonIcon";
import RepNavLink from "@/components/RepNavLink";

const navItems = [
  { href: "/app", label: "خانه", icon: "🏠" },
  { href: "/app/plan", label: "برنامه هفتگی", icon: "📅" },
  { href: "/app/doctors", label: "پزشکان", icon: "🩺" },
  { href: "/app/pharmacies", label: "داروخانه‌ها", icon: "💊" },
  { href: "/app/visits", label: "ویزیت‌های من", icon: "📋" },
];

export default async function RepAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-brand-light/70 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <RibbonIcon className="h-6 w-5" />
          <span className="text-sm font-bold text-ink">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "MANAGER" && (
            <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-brand-dark">
              ↖ بازگشت به پنل مدیریت
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 bg-background p-4 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-brand-light bg-white/95 backdrop-blur">
        {navItems.map((item) => (
          <RepNavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
        ))}
      </nav>
    </div>
  );
}
