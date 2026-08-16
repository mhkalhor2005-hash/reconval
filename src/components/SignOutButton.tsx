"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  async function onClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-100 ${className}`}
    >
      خروج
    </button>
  );
}
