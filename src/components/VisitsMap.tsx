"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapVisit = {
  id: number;
  lat: number;
  lng: number;
  checkin_at: string;
  outcome: string | null;
  doctor_name: string;
  rep_name: string;
};

const OUTCOME_COLOR: Record<string, string> = {
  POSITIVE: "#1f7a4d",
  NEUTRAL: "#c98a3e",
  FOLLOW_UP: "#2f6fb0",
  NEGATIVE: "#c0392b",
};

const OUTCOME_LABEL: Record<string, string> = {
  POSITIVE: "مثبت",
  NEUTRAL: "خنثی",
  FOLLOW_UP: "نیاز به پیگیری",
  NEGATIVE: "منفی",
};

export default function VisitsMap({ visits }: { visits: MapVisit[] }) {
  const center: [number, number] =
    visits.length > 0 ? [visits[0].lat, visits[0].lng] : [35.7219, 51.3347]; // Tehran fallback

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: "380px", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {visits.map((v) => (
        <CircleMarker
          key={v.id}
          center={[v.lat, v.lng]}
          radius={8}
          pathOptions={{
            color: OUTCOME_COLOR[v.outcome ?? ""] ?? "#555",
            fillColor: OUTCOME_COLOR[v.outcome ?? ""] ?? "#555",
            fillOpacity: 0.75,
          }}
        >
          <Popup>
            <div style={{ fontFamily: "sans-serif", textAlign: "right" }} dir="rtl">
              <strong>{v.doctor_name}</strong>
              <br />
              ویزیتور: {v.rep_name}
              <br />
              نتیجه: {OUTCOME_LABEL[v.outcome ?? ""] ?? "—"}
              <br />
              {new Date(v.checkin_at).toLocaleString("fa-IR")}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
