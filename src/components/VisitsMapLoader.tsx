"use client";

import dynamic from "next/dynamic";
import type { MapVisit } from "./VisitsMap";

const VisitsMap = dynamic(() => import("./VisitsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-full items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400">
      در حال بارگذاری نقشه...
    </div>
  ),
});

export default function VisitsMapLoader({ visits }: { visits: MapVisit[] }) {
  return <VisitsMap visits={visits} />;
}
