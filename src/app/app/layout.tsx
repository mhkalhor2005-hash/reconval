import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import OfflineSyncManager from "@/components/OfflineSyncManager";

const navItems = [
  { href: "/app", label: "خانه", icon: "🏠" },
  { href: "/app/doctors", label: "پزشکان", icon: "🩺" },
  { href: "/app/visits", label: "ویزیت‌های من", icon: "📋" },
  { href: "/app/inventory", label: "موجودی من", icon: "💊" },
];

export default async function RepAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-xs font-bold text-white">
            ر
          </div>
          <span className="text-sm font-bold text-brand-dark">{user.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "MANAGER" && (
            <Link href="/dashboard" className="text-xs text-neutral-400 hover:text-neutral-600">
              ↖ بازگشت به پنل مدیریت
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 bg-neutral-50 p-4 pb-24">{children}</main>

      <OfflineSyncManager />

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-neutral-600 hover:text-brand"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
