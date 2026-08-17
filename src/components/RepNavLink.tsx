"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RepNavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/app" ? pathname === href : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
        active ? "text-brand" : "text-neutral-500 hover:text-brand"
      }`}
    >
      {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gradient-to-r from-brand to-accent" />}
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </Link>
  );
}
