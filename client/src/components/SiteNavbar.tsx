import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MARKETING_NAV } from "@/lib/brand";
import { useAuth } from "@/_core/hooks/useAuth";

// Marketing navbar for the landing page. Turns solid on scroll, collapses on mobile,
// and reflects the real auth state (name + dashboard/logout when signed in).
export function SiteNavbar({ onLogin }: { onLogin: () => void }) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-lg"
          : "border-b border-transparent"
      }`}
    >
      <nav className="container flex h-16 items-center justify-between gap-4">
        <button onClick={() => setLocation("/")} aria-label="الصفحة الرئيسية">
          <Logo />
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {MARKETING_NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <span className="max-w-[10rem] truncate text-sm font-medium text-muted-foreground">
                {user?.name || "مستخدم"}
              </span>
              <button onClick={() => setLocation("/dashboard")} className="btn btn-primary">
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </button>
              <button onClick={() => logout()} className="btn btn-ghost" aria-label="تسجيل الخروج">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="btn btn-ghost">تسجيل الدخول</button>
              <button onClick={onLogin} className="btn btn-primary">ابدأ الآن</button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {MARKETING_NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <button onClick={() => setLocation("/dashboard")} className="btn btn-primary w-full">
                  لوحة التحكم
                </button>
              ) : (
                <>
                  <button onClick={onLogin} className="btn btn-ghost w-full">تسجيل الدخول</button>
                  <button onClick={onLogin} className="btn btn-primary w-full">ابدأ الآن</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default SiteNavbar;
