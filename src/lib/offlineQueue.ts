"use client";

// Lightweight offline-first queue for visits captured while the rep's
// browser has no connectivity. Persisted to localStorage so it survives
// page reloads; flushed to /api/visits/sync once the device is back online.

export type PendingVisit = {
  clientUuid: string;
  doctorId: number;
  doctorName: string;
  checkinAt: string;
  checkoutAt: string | null;
  lat: number | null;
  lng: number | null;
  outcome: string | null;
  note: string | null;
  deliveries: { productId: number; productName: string; qty: number }[];
};

const KEY = "rekanwal_pending_visits";
const ACTIVE_KEY = "rekanwal_active_local_visit";

export type ActiveLocalVisit = {
  clientUuid: string;
  doctorId: number;
  doctorName: string;
  checkinAt: string;
  lat: number | null;
  lng: number | null;
};

export function getActiveLocal(): ActiveLocalVisit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveLocal(v: ActiveLocalVisit) {
  window.localStorage.setItem(ACTIVE_KEY, JSON.stringify(v));
}

export function clearActiveLocal() {
  window.localStorage.removeItem(ACTIVE_KEY);
}

export function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `v-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPending(): PendingVisit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function queueVisit(visit: PendingVisit) {
  const all = getPending();
  all.push(visit);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

function removeByUuids(uuids: string[]) {
  const all = getPending().filter((v) => !uuids.includes(v.clientUuid));
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export async function syncPending(): Promise<{ syncedCount: number; remaining: number }> {
  const pending = getPending();
  if (pending.length === 0) return { syncedCount: 0, remaining: 0 };
  try {
    const res = await fetch("/api/visits/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visits: pending.map((v) => ({
          clientUuid: v.clientUuid,
          doctorId: v.doctorId,
          checkinAt: v.checkinAt,
          checkoutAt: v.checkoutAt,
          lat: v.lat,
          lng: v.lng,
          outcome: v.outcome,
          note: v.note,
          deliveries: v.deliveries.map((d) => ({ productId: d.productId, qty: d.qty })),
        })),
      }),
    });
    if (!res.ok) return { syncedCount: 0, remaining: pending.length };
    const data = await res.json();
    const syncedUuids: string[] = (data.synced ?? []).map((s: { clientUuid: string }) => s.clientUuid);
    removeByUuids(syncedUuids);
    return { syncedCount: syncedUuids.length, remaining: getPending().length };
  } catch {
    return { syncedCount: 0, remaining: pending.length };
  }
}
