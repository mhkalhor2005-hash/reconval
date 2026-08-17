import RibbonIcon from "./RibbonIcon";

const SIZE_MAP = {
  sm: { icon: "h-6 w-5", text: "text-base", sub: "text-[8px]", gap: "gap-1.5" },
  md: { icon: "h-8 w-6", text: "text-xl", sub: "text-[9px]", gap: "gap-2" },
  lg: { icon: "h-12 w-9", text: "text-3xl", sub: "text-[11px]", gap: "gap-3" },
} as const;

export default function Logo({
  size = "md",
  withSubtitle = false,
  dark = false,
  className = "",
}: {
  size?: keyof typeof SIZE_MAP;
  withSubtitle?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const s = SIZE_MAP[size];
  return (
    <div className={`flex items-center ${s.gap} ${className}`} dir="ltr">
      <RibbonIcon className={`${s.icon} shrink-0`} />
      <div className="flex flex-col leading-none">
        <span
          className={`font-display ${s.text} font-semibold tracking-wide ${dark ? "text-white" : "text-ink"}`}
        >
          Rec<span className="text-brand">o</span>nval
        </span>
        {withSubtitle && (
          <span
            className={`${s.sub} mt-1 font-sans font-medium uppercase tracking-[0.25em] ${
              dark ? "text-white/70" : "text-neutral-400"
            }`}
          >
            Dermaceutics
          </span>
        )}
      </div>
    </div>
  );
}
