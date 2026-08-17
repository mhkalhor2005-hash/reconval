import Link from "next/link";
import Logo from "@/components/Logo";

const features = [
  {
    title: "برنامه هفتگی ویزیت",
    desc: "مدیر هر هفته پزشکان هر ویزیتور را برنامه‌ریزی می‌کند؛ ویزیتور در پنل خودش نتیجه هر ویزیت را ثبت می‌کند.",
    icon: "📅",
  },
  {
    title: "مدیریت داروخانه‌ها",
    desc: "ثبت سفارش هر داروخانه با تاریخ و تعداد دقیق، به همراه سابقه کامل برای هر ویزیتور.",
    icon: "💊",
  },
  {
    title: "داشبورد مدیریتی زنده",
    desc: "عملکرد هر نماینده در برابر هدف، نتیجه ویزیت‌ها و یادداشت‌های خودکار پزشکان، بدون تماس تلفنی.",
    icon: "📊",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-brand-light/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <Link
            href="/login"
            className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:opacity-90"
          >
            ورود به پنل
          </Link>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <div className="ribbon-watermark" />
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 text-center">
          <span className="rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand-dark">
            پلتفرم اختصاصی تیم فروش ریکنوال
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.4] text-ink sm:text-5xl">
            مدیریت هوشمند فروش و ویزیت پزشکان
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            یک پنل مدیریتی و اپلیکیشن سبک برای ویزیتورها؛ برنامه‌ریزی هفتگی ویزیت پزشکان، مدیریت
            سفارش داروخانه‌ها، و دیدن وضعیت واقعی میدان در یک نگاه.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-white shadow-lg shadow-brand/25 transition hover:opacity-90"
            >
              ورود به پنل
            </Link>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card card-hover p-6 text-right">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-2xl">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink">{f.title}</h3>
                <p className="text-sm leading-7 text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-light/70 py-6 text-center text-sm text-neutral-500">
        نسخه آزمایشی MVP — ریکنوال © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
