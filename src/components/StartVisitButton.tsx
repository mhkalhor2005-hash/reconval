"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uuid, setActiveLocal } from "@/lib/offlineQueue";

function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function StartVisitButton({ doctorId, doctorName }: { doctorId: number; doctorName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onStart() {
    setLoading(true);
    setError("");
    const pos = await getPosition();
    const lat = pos?.coords.latitude ?? null;
    const lng = pos?.coords.longitude ?? null;
    const clientUuid = uuid();

    try {
      if (!navigator.onLine) throw new Error("offline");
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, lat, lng, clientUuid }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "شروع ویزیت ناموفق بود.");
      }
      router.push("/app/visits/active");
      router.refresh();
    } catch (e) {
      if ((e as Error).message === "offline" || !navigator.onLine) {
        // Offline-first fallback: record locally, sync later.
        setActiveLocal({
          clientUuid,
          doctorId,
          doctorName,
          checkinAt: new Date().toISOString(),
          lat,
          lng,
        });
        router.push("/app/visits/active");
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={onStart}
        disabled={loading}
        className="w-full rounded-lg bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "در حال ثبت موقعیت..." : "▶ شروع ویزیت"}
      </button>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
