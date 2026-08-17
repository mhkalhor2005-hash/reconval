"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ورود ناموفق بود.");
        setLoading(false);
        return;
      }
      const next = params.get("next");
      const target = next || (data.role === "MANAGER" ? "/dashboard" : "/app");
      router.push(target);
      router.refresh();
    } catch {
      setError("خطا در اتصال به سرور.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div className="ribbon-watermark" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" withSubtitle className="mb-5" />
          <h1 className="text-xl font-bold text-ink">ورود به پنل ریکنوال</h1>
          <p className="mt-1 text-sm text-neutral-500">با نام کاربری و رمز عبور خود وارد شوید</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">نام کاربری</label>
            <input
              name="username"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none transition focus:border-brand"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">رمز عبور</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none transition focus:border-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-gradient py-2.5 font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
