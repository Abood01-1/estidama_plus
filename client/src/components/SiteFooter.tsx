import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";

// Dark premium footer shared across marketing + content pages.
export function SiteFooter() {
  const [, setLocation] = useLocation();

  const columns: { title: string; links: { label: string; href: string; nav?: boolean }[] }[] = [
    {
      title: "المنتج",
      links: [
        { label: "كيف يعمل", href: "#how" },
        { label: "المساعد الذكي", href: "/assistant", nav: true },
        { label: "الحاسبة", href: "/calculator", nav: true },
        { label: "لوحة التحكم", href: "/dashboard", nav: true },
      ],
    },
    {
      title: "المنصة",
      links: [
        { label: "عن استدامة", href: "/about", nav: true },
        { label: "المنهجية العلمية", href: "/methodology", nav: true },
        { label: "سياسة الخصوصية", href: "/privacy", nav: true },
      ],
    },
  ];

  return (
    <footer className="surface-ink">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            منصة إماراتية تستخدم الذكاء الاصطناعي لقياس بصمتك الكربونية واتخاذ قرارات أكثر استدامة —
            دعمًا لرؤية الحياد المناخي 2050.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.nav ? (
                    <button
                      onClick={() => setLocation(l.href)}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <a href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-sm text-white/50 md:flex-row">
          <p>© 2026 Estidama AI — جميع الحقوق محفوظة.</p>
          <p>صُنع في الإمارات العربية المتحدة 🇦🇪</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
