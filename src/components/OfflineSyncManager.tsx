"use client";

import { useEffect, useState } from "react";
import { getPending, syncPending } from "@/lib/offlineQueue";

export default function OfflineSyncManager() {
  const [pendingCount, setPendingCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function trySync() {
    if (getPending().length === 0) return;
    setSyncing(true);
    await syncPending();
    setPendingCount(getPending().length);
    setSyncing(false);
  }

  useEffect(() => {
    setOnline(navigator.onLine);
    setPendingCount(getPending().length);

    const onOnline = () => {
      setOnline(true);
      trySync();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const interval = setInterval(() => {
      setPendingCount(getPending().length);
      if (navigator.onLine) trySync();
    }, 15000);

    trySync();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (online && pendingCount === 0) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-16 z-40 mx-auto w-fit rounded-full px-4 py-1.5 text-xs font-medium shadow sm:bottom-4 ${
        online ? "bg-amber-100 text-amber-800" : "bg-neutral-800 text-white"
      }`}
    >
      {!online && "حالت آفلاین — ویزیت‌ها به‌صورت محلی ذخیره می‌شوند"}
      {online && pendingCount > 0 && (syncing ? "در حال همگام‌سازی..." : `${pendingCount} مورد در صف ارسال`)}
    </div>
  );
}
