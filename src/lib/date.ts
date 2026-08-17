// Shared Persian (Jalali) date/time formatting helpers.
//
// The app's data and users are all Iran-based, but the server (Render) runs
// in UTC. `toLocaleDateString("fa-IR")` without an explicit `timeZone`
// silently uses the server's own timezone, so a visit or order logged at
// 11pm Tehran time could render as "tomorrow" (or vice versa). Pinning
// `timeZone: "Asia/Tehran"` here makes every date/time in the app correct
// regardless of where it's rendered.
const TEHRAN_TZ = "Asia/Tehran";

/** e.g. "۱۴۰۵/۵/۳۰" */
export function formatJalaliDate(value: string | number | Date): string {
  return new Date(value).toLocaleDateString("fa-IR", { timeZone: TEHRAN_TZ });
}

/** e.g. "۱۴۰۵/۵/۳۰، ۱۴:۰۵" */
export function formatJalaliDateTime(value: string | number | Date): string {
  return new Date(value).toLocaleString("fa-IR", {
    timeZone: TEHRAN_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
