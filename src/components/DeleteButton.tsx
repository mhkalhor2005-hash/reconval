"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  confirmLabel = "مطمئنید؟ این عمل قابل بازگشت نیست.",
  redirectTo,
  label = "🗑️ حذف",
}: {
  url: string;
  confirmLabel?: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function doDelete() {
    setBusy(true);
    setError("");
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "خطا در حذف.");
      setConfirming(false);
      return;
    }
    setConfirming(false);
    if (redirectTo) {
      // A plain router.push() here can serve a stale, already-prefetched
      // RSC payload for the destination route (e.g. the sidebar nav link
      // prefetches /dashboard/reps in the background), so the deleted row
      // would still appear to be there. Force a real navigation instead —
      // guarantees the destination is always fetched fresh from the server.
      window.location.href = redirectTo;
      return;
    }
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-red-700">{confirmLabel}</span>
        <button
          type="button"
          onClick={doDelete}
          disabled={busy}
          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "..." : "بله، حذف کن"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium transition hover:bg-brand-light/40"
        >
          انصراف
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
      >
        {label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
