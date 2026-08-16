"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  function fill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl font-bold text-white">
            ر
          </div>
          <h1 className="text-xl font-bold text-neutral-900">ورود به پنل ریکنوال</h1>
          <p className="mt-1 text-sm text-neutral-500">با نام کاربری و رمز عبور خود وارد شوید</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">نام کاربری</label>
            <input
              name="username"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="card mt-4 p-4 text-xs leading-6 text-neutral-500">
          <p className="mb-2 font-semibold text-neutral-700">حساب‌های نمایشی:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fill("manager", "manager123")}
              className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-100"
            >
              مدیر فروش: manager / manager123
            </button>
            <button
              type="button"
              onClick={() => fill("rep1", "rep123")}
              className="rounded-md border border-neutral-300 px-2 py-1 hover:bg-neutral-100"
            >
              ویزیتور: rep1 / rep123
            </button>
          </div>
        </div>
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
