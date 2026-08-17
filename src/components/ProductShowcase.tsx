import Image from "next/image";
import Reveal from "./Reveal";

const PRODUCTS = [
  { src: "/products/sunscreen-tinted-dark-spot.webp", name: "ضدآفتاب رنگی", tag: "مناسب لک" },
  { src: "/products/sunscreen-clear-oily.webp", name: "ضدآفتاب بی‌رنگ", tag: "پوست چرب" },
  { src: "/products/sunscreen-tinted-normal-dry.webp", name: "ضدآفتاب رنگی", tag: "نرمال تا خشک" },
  { src: "/products/sunscreen-clear-normal-dry.webp", name: "ضدآفتاب بی‌رنگ", tag: "نرمال تا خشک" },
  { src: "/products/wrinkle-cream.webp", name: "کرم ضدچروک", tag: "پوست دارای چروک" },
  { src: "/products/night-cream-dark-spot.webp", name: "کرم شب", tag: "مناسب لک" },
  { src: "/products/day-cream-dark-spot.webp", name: "کرم روز", tag: "مناسب لک" },
  { src: "/products/brightening-body-cream.webp", name: "کرم روشن‌کننده", tag: "پوست بدن" },
  { src: "/products/eye-wrinkle-cream.webp", name: "کرم دور چشم", tag: "ضدچروک" },
  { src: "/products/eye-cream-dark-circles.webp", name: "کرم دور چشم", tag: "تیرگی و پف" },
];

export default function ProductShowcase() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <Reveal className="mb-10 text-center">
        <span className="rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand-dark">
          محصولات ریکنوال
        </span>
        <h2 className="mx-auto mt-4 max-w-xl text-2xl font-extrabold text-ink sm:text-3xl">
          مراقبت پوستی که تیم فروش هر روز معرفی می‌کند
        </h2>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PRODUCTS.map((p, i) => (
          <Reveal key={p.src} delay={(i % 5) * 80}>
            <div className="card card-hover group overflow-hidden p-0">
              <div className="relative aspect-square overflow-hidden bg-brand-light/40">
                <Image
                  src={p.src}
                  alt={`${p.name} ${p.tag}`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-bold text-ink">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.tag}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
