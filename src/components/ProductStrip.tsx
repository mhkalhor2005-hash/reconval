import Image from "next/image";

const SLIDES = [
  { src: "/products/wrinkle-cream.webp", label: "کرم ضدچروک" },
  { src: "/products/sunscreen-tinted-dark-spot.webp", label: "ضدآفتاب رنگی" },
  { src: "/products/night-cream-dark-spot.webp", label: "کرم شب" },
  { src: "/products/eye-cream-dark-circles.webp", label: "کرم دور چشم" },
];

const SLOT_SECONDS = 4;
const CYCLE_SECONDS = SLIDES.length * SLOT_SECONDS;

/**
 * Small, professional product crossfade — pure CSS, no client JS.
 * Used as a compact brand touch inside internal panels (dashboard sidebar,
 * rep home) where a full showcase grid would be too much.
 */
export default function ProductStrip({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border ${dark ? "border-white/10 bg-white/5" : "border-brand-light bg-brand-light/30"} p-3`}
    >
      <p className={`mb-2 text-[11px] font-medium ${dark ? "text-white/50" : "text-neutral-500"}`}>محصولات ریکنوال</p>
      <div className="relative h-24 w-full overflow-hidden rounded-lg bg-white/40">
        {SLIDES.map((s, i) => (
          <div
            key={s.src}
            className="product-strip-slide absolute inset-0"
            style={{ animationDuration: `${CYCLE_SECONDS}s`, animationDelay: `${i * SLOT_SECONDS}s` }}
          >
            <Image src={s.src} alt={s.label} fill sizes="300px" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 text-[11px] font-medium text-white">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
