"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute inset-y-1.5 right-0 w-1 rounded-full bg-gradient-to-b from-brand to-accent" />
      )}
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
