import Link from "next/link";

const features = [
  {
    title: "ثبت ویزیت با موقعیت مکانی",
    desc: "ویزیتورها ویزیت هر پزشک را با چک‌این GPS ثبت می‌کنند؛ حتی بدون اینترنت، و همگام‌سازی خودکار پس از اتصال مجدد.",
    icon: "📍",
  },
  {
    title: "مدیریت نمونه دارویی و هدایا",
    desc: "کاتالوگ محصول، تخصیص موجودی به هر ویزیتور و ثبت دقیق تحویل نمونه در هر ویزیت.",
    icon: "💊",
  },
  {
    title: "داشبورد مدیریتی زنده",
    desc: "عملکرد هر نماینده در برابر هدف، نقشه پراکندگی بازدیدها و گزارش مصرف نمونه، بدون تماس تلفنی.",
    icon: "📊",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white font-bold">ر</div>
            <span className="text-lg font-bold text-brand-dark">ریکنوال</span>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            ورود به پنل
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <span className="rounded-full bg-brand-light px-4 py-1 text-sm font-medium text-brand-dark">
            پلتفرم اختصاصی تیم فروش ریکنوال
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.4] text-neutral-900 sm:text-5xl">
            مدیریت هوشمند فروش و ویزیت پزشکان
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
            یک پنل مدیریتی و اپلیکیشن سبک برای ویزیتورها؛ ثبت ویزیت، مدیریت نمونه دارویی و هدایا، و
            دیدن وضعیت واقعی میدان در یک نگاه.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-dark"
            >
              ورود به پنل
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6 text-right">
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-neutral-900">{f.title}</h3>
                <p className="text-sm leading-7 text-neutral-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500">
        نسخه آزمایشی MVP — ریکنوال © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
