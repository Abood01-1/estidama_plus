import { ArrowRight, Sparkles, Target, LayoutDashboard, Globe, Trophy, FileText, Zap, TrendingUp, Brain, Leaf, ChevronDown, Menu, X, LogOut, User, BarChart3, LineChart, Shield, Sun, CloudRain, TreePine } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startSupabaseLogin } from "@/lib/supabaseAuth";
import { BRAND, MARKETING_NAV, HOW_IT_WORKS, FEATURES, IMPACT_STATS } from "@/lib/brand";

// Google Icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
console.log("azazazazazazazazazazazazazazazaz")
// Section label component
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
      style={{ background: 'rgba(207, 20, 43, 0.08)', color: BRAND.colors.red, border: '1px solid rgba(207, 20, 43, 0.15)' }}>
      <Sparkles className="w-3.5 h-3.5" />
      {children}
    </div>
  );
}

// Icon chooser for features
function FeatureIcon({ icon, color }: { icon: string; color: string }) {
  const iconColor = color === 'red' ? BRAND.colors.red : color === 'green' ? BRAND.colors.green : BRAND.colors.gold;
  const IconComponent = 
    icon === 'Target' ? Target :
    icon === 'Sparkles' ? Sparkles :
    icon === 'LayoutDashboard' ? LayoutDashboard :
    icon === 'Globe' ? Globe :
    icon === 'Trophy' ? Trophy :
    icon === 'FileText' ? FileText : Sparkles;
  return <IconComponent className="w-7 h-7" style={{ color: iconColor }} />;
}

function StepIcon({ name }: { name: string }) {
  const IconComponent = 
    name === 'UserPlus' ? User :
    name === 'FileInput' ? FileText :
    name === 'Brain' ? Brain :
    name === 'TrendingUp' ? TrendingUp : Zap;
  return <IconComponent className="w-6 h-6" />;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      // Update active section
      const sections = ['hero', 'how', 'features', 'ai', 'methodology', 'impact'];
      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const userName = user?.name || "مستخدم";

  const handleLogin = () => setShowLoginForm(true);

  const handleLogout = () => logout();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    } else {
      handleLogin();
    }
  };

  // Count-up animation state
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    const targets = [12, 4, 50, 2071];
    const intervals = targets.map((target, i) => {
      return setInterval(() => {
        setCounts(prev => {
          const next = [...prev];
          if (next[i] < target) {
            next[i] = Math.min(next[i] + Math.ceil(target / 20), target);
          }
          return next;
        });
      }, 60 + i * 30);
    });
    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="rtl min-h-screen bg-background text-foreground">
      {/* ════════════════════════════════════════════════
          0. NAVIGATION — Glassmorphism premium navbar
         ════════════════════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="container flex h-16 md:h-18 items-center justify-between gap-4">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2 no-underline">
            <span className="relative inline-flex h-8 w-8 items-center justify-center">
              <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
                <defs>
                  <linearGradient id="navLogo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#CF142B" />
                    <stop offset="50%" stopColor="#C8A951" />
                    <stop offset="100%" stopColor="#009933" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="url(#navLogo)" />
                <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                <circle cx="27.5" cy="13.5" r="2.8" fill="#fff" />
                <circle cx="27.5" cy="13.5" r="1.2" fill="#CF142B" />
              </svg>
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Estidama <span style={{ color: BRAND.colors.red }}>AI</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {MARKETING_NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSection === link.href.slice(1)
                    ? "text-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">{userName}</span>
                <button onClick={() => setLocation("/dashboard")} className="btn btn-primary btn-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </button>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" aria-label="تسجيل الخروج">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} className="btn btn-ghost btn-sm">تسجيل الدخول</button>
                <button onClick={handleGetStarted} className="btn btn-primary btn-sm">
                  ابدأ الآن
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background/95 backdrop-blur-lg md:hidden animate-fade-in">
            <div className="container flex flex-col gap-1 py-4">
              {MARKETING_NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => setLocation("/dashboard")} className="btn btn-primary w-full">
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </button>
                    <button onClick={handleLogout} className="btn btn-outline w-full">
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleLogin} className="btn btn-primary w-full">
                      ابدأ الآن
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={handleLogin} className="btn btn-ghost w-full">تسجيل الدخول</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════
          1. HERO SECTION — Premium dark with aurora
         ════════════════════════════════════════════════ */}
      <section id="hero" className="hero-dark hero-grid min-h-screen flex items-center relative overflow-hidden pt-20">
        {/* Aurora blobs */}
        <div className="aurora-blob w-[600px] h-[600px] -top-48 -right-32" style={{ background: 'radial-gradient(circle, rgba(207,20,43,0.2), transparent)' }} />
        <div className="aurora-blob aurora-blob-2 w-[500px] h-[500px] top-1/3 -left-32" style={{ background: 'radial-gradient(circle, rgba(0,153,51,0.15), transparent)' }} />
        <div className="aurora-blob aurora-blob-3 w-[400px] h-[400px] bottom-0 right-1/4" style={{ background: 'radial-gradient(circle, rgba(200,169,81,0.12), transparent)' }} />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8 py-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium animate-fade-up"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: BRAND.colors.goldLight }}>
                <Sparkles className="w-3.5 h-3.5" />
                مدعوم بالذكاء الاصطناعي • الإمارات العربية المتحدة
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight hero-title-gradient animate-fade-up delay-100">
                استخدم الذكاء الاصطناعي<br />
                لفهم بصمتك الكربونية<br />
                <span className="gradient-text-uae">واتخذ قرارات أكثر استدامة</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl leading-relaxed opacity-80 max-w-xl animate-fade-up delay-200" style={{ color: '#C8D0E0' }}>
                {BRAND.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
                <button onClick={handleGetStarted} className="btn btn-primary btn-lg text-base px-10">
                  ابدأ رحلتك الآن
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={handleLogin} className="btn btn-light btn-lg text-base px-8">
                  تسجيل الدخول
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-sm animate-fade-up delay-400" style={{ color: '#8899AA' }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  تسجيل آمن عبر Google
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  نتائج دقيقة علمياً
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  مجاني تماماً
                </div>
              </div>
            </div>

            {/* Right: Visual / Preview */}
            <div className="hidden lg:flex items-center justify-center py-12 animate-fade-in delay-300">
              <div className="relative w-full max-w-lg">
                {/* Main glass card */}
                <div className="card-glass p-8 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium" style={{ color: BRAND.colors.goldLight }}>
                      بصمتك الكربونية
                    </span>
                    <span className="pill text-xs flex items-center gap-1.5" style={{ background: 'rgba(0,153,51,0.15)', color: BRAND.colors.greenLight, borderColor: 'rgba(0,153,51,0.2)' }}>
                      <Leaf className="w-3 h-3" />
                      في تحسن
                    </span>
                  </div>

                  {/* Big number */}
                  <div className="text-center mb-6">
                    <div className="text-5xl font-black hero-title-gradient">8.4</div>
                    <div className="text-sm mt-1 opacity-60">طن CO₂ / سنة</div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#C8D0E0' }}>المواصلات</span>
                        <span style={{ color: BRAND.colors.redLight }}>3.2 طن</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full w-[38%] progress-red"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#C8D0E0' }}>الكهرباء</span>
                        <span style={{ color: BRAND.colors.greenLight }}>2.8 طن</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full w-[33%] progress-green"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#C8D0E0' }}>الغذاء</span>
                        <span style={{ color: BRAND.colors.goldLight }}>1.5 طن</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full w-[18%]" style={{ background: 'linear-gradient(90deg, #C8A951, #E0C876)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#C8D0E0' }}>المياه</span>
                        <span style={{ color: '#6EC6FF' }}>0.9 طن</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full w-[11%]" style={{ background: 'linear-gradient(90deg, #6EC6FF, #009B9B)' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* AI recommendation snippet */}
                  <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND.colors.goldLight }} />
                      <div>
                        <p className="text-sm font-medium mb-0.5">توصية AI</p>
                        <p className="text-xs opacity-70">استخدام المواصلات العامة يومين أسبوعياً يقلل بصمتك بنسبة ~12%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating decorative element */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(207,20,43,0.3), rgba(200,169,81,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-7 h-7" style={{ color: BRAND.colors.greenLight }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-12 animate-float">
            <ChevronDown className="w-6 h-6 opacity-40" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          2. HOW IT WORKS — User journey in 4 steps
         ════════════════════════════════════════════════ */}
      <section id="how" className="section surface-premium-light">
        <div className="container">
          <div className="text-center mb-16">
            <SectionLabel>رحلة المستخدم</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-black mb-4">كيف يعمل النظام</h2>
            <div className="divider-uae mb-4"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              أربع خطوات بسيطة لبدء رحلتك نحو الاستدامة مع الذكاء الاصطناعي
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-8 relative">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.step} className="relative animate-fade-up" style={{ animationDelay: `${0.1 * index}s` }}>
                {/* Connector line (desktop) */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block step-connector"></div>
                )}

                <div className="card-premium p-6 lg:p-8 text-center relative z-10 h-full flex flex-col items-center">
                  {/* Step number */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white font-bold text-xl mx-auto"
                    style={{
                      background: index === 0 ? 'linear-gradient(135deg, #CF142B, #E63950)' :
                                 index === 1 ? 'linear-gradient(135deg, #C8A951, #E0C876)' :
                                 index === 2 ? 'linear-gradient(135deg, #009933, #00CC44)' :
                                              'linear-gradient(135deg, #CF142B, #009933)'
                    }}>
                    <StepIcon name={step.icon} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full mb-3"
                    style={{
                      background: index === 0 ? 'rgba(207,20,43,0.1)' :
                                 index === 1 ? 'rgba(200,169,81,0.1)' :
                                 index === 2 ? 'rgba(0,153,51,0.1)' :
                                              'rgba(207,20,43,0.08)',
                      color: index === 0 ? BRAND.colors.red :
                             index === 1 ? BRAND.colors.gold :
                             index === 2 ? BRAND.colors.green : BRAND.colors.red,
                    }}>
                    الخطوة {step.step}
                  </span>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          3. FEATURES — Premium feature cards
         ════════════════════════════════════════════════ */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-16">
            <SectionLabel>المميزات</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-black mb-4">لماذا Estidama AI؟</h2>
            <div className="divider-uae mb-4"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              منصة متكاملة تجمع بين الذكاء الاصطناعي والاستدامة والهوية الإماراتية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div key={index} className="card-premium p-8 animate-fade-up" style={{ animationDelay: `${0.08 * index}s` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: feature.color === 'red' ? 'rgba(207,20,43,0.08)' :
                               feature.color === 'green' ? 'rgba(0,153,51,0.08)' : 'rgba(200,169,81,0.08)',
                  }}>
                  <FeatureIcon icon={feature.icon} color={feature.color} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          4. AI SECTION — Showcasing the intelligence
         ════════════════════════════════════════════════ */}
      <section id="ai" className="section hero-dark hero-grid relative overflow-hidden">
        <div className="aurora-blob w-[400px] h-[400px] top-1/2 left-1/4" style={{ background: 'radial-gradient(circle, rgba(0,153,51,0.12), transparent)' }} />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: content */}
            <div className="space-y-6 animate-fade-in-left">
              <SectionLabel>الذكاء الاصطناعي</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-black hero-title-gradient">
                ذكاء اصطناعي <span className="gradient-text-green">مصمم للاستدامة</span>
              </h2>
              <p className="text-lg opacity-75 leading-relaxed" style={{ color: '#C8D0E0' }}>
                محرك AI متطور يحلل بياناتك بدقة، ويفهم نمط حياتك، ويقدم توصيات مخصصة 
                لتقليل بصمتك الكربونية بناءً على معايير علمية معتمدة.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,153,51,0.12)' }}>
                    <Brain className="w-5 h-5" style={{ color: BRAND.colors.greenLight }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">تحليل ذكي للبيانات</h4>
                    <p className="text-sm opacity-60">يحلل AI استهلاكك في المواصلات، الكهرباء، المياه، والغذاء لحساب بصمتك بدقة</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,169,81,0.12)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: BRAND.colors.goldLight }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">توصيات شخصية</h4>
                    <p className="text-sm opacity-60">يقدم AI توصيات مخصصة حسب نمط حياتك مع تقدير التوفير المتوقع</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(207,20,43,0.12)' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: BRAND.colors.redLight }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">تتبع وتحسين مستمر</h4>
                    <p className="text-sm opacity-60">يتابع AI تقدمك شهرياً ويقترح خطوات جديدة لتحسين أدائك البيئي</p>
                  </div>
                </div>
              </div>

              <button onClick={handleGetStarted} className="btn btn-green mt-6">
                جرب التحليل الذكي
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: AI visual */}
            <div className="hidden lg:flex justify-center animate-fade-in-right">
              <div className="card-glass-dark p-8 rounded-3xl max-w-sm w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.2)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: BRAND.colors.greenLight }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">المساعد الذكي</div>
                    <div className="text-xs opacity-50">AI Carbon Assistant</div>
                  </div>
                  <div className="mr-auto">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,153,51,0.15)', color: BRAND.colors.greenLight }}>نشط</span>
                  </div>
                </div>

                {/* Chat bubbles */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm mb-2 font-medium" style={{ color: BRAND.colors.goldLight }}>مرحباً بك 👋</p>
                    <p className="text-xs opacity-60">لنحلل بصمتك الكربونية معاً. أدخل بيانات استهلاكك وسأقدم لك تحليلاً شاملاً.</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(0,153,51,0.06)', border: '1px solid rgba(0,153,51,0.1)' }}>
                    <p className="text-xs opacity-50 mb-1">أنت</p>
                    <p className="text-sm">استهلاكي الكهربائي 800 kWh شهرياً</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(207,20,43,0.06)', border: '1px solid rgba(207,20,43,0.1)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: BRAND.colors.goldLight }} />
                      <span className="text-xs" style={{ color: BRAND.colors.goldLight }}>AI</span>
                    </div>
                    <p className="text-sm">استخدام الطاقة الشمسية يمكن أن يقلل بصمتك حتى 40%. هل ترغب في معرفة المزيد؟</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          5. METHODOLOGY — Scientific credibility
         ════════════════════════════════════════════════ */}
      <section id="methodology" className="section surface-premium-light">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-6 animate-fade-in-left">
              <SectionLabel>المنهجية العلمية</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-black mb-2">دقة علمية <span className="gradient-text-uae">ومعايير عالمية</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                تعتمد حسابات Estidama AI على منهجيات معتمدة من الهيئات العالمية مع تكييفها 
                للواقع الإماراتي لضمان دقة النتائج.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="card-premium p-5">
                  <Shield className="w-6 h-6 mb-2" style={{ color: BRAND.colors.red }} />
                  <h4 className="font-bold text-sm mb-1">EPA Standards</h4>
                  <p className="text-xs text-muted-foreground">معايير وكالة حماية البيئة الأمريكية</p>
                </div>
                <div className="card-premium p-5">
                  <Globe className="w-6 h-6 mb-2" style={{ color: BRAND.colors.gold }} />
                  <h4 className="font-bold text-sm mb-1">IPCC Guidelines</h4>
                  <p className="text-xs text-muted-foreground">إرشادات الهيئة الحكومية الدولية المعنية بتغير المناخ</p>
                </div>
                <div className="card-premium p-5">
                  <BarChart3 className="w-6 h-6 mb-2" style={{ color: BRAND.colors.green }} />
                  <h4 className="font-bold text-sm mb-1">عوامل إماراتية</h4>
                  <p className="text-xs text-muted-foreground">معاملات انبعاثات مخصصة لشبكة الكهرباء وتحلية المياه في الإمارات</p>
                </div>
                <div className="card-premium p-5">
                  <Sun className="w-6 h-6 mb-2" style={{ color: BRAND.colors.gold }} />
                  <h4 className="font-bold text-sm mb-1">تحديث مستمر</h4>
                  <p className="text-xs text-muted-foreground">بيانات محدثة باستمرار وفقاً لأحدث التقارير</p>
                </div>
              </div>
            </div>

            {/* Right: Sources */}
            <div className="animate-fade-in-right">
              <div className="card-premium p-8">
                <h3 className="text-xl font-bold mb-6">مصادر البيانات المعتمدة</h3>
                <div className="space-y-4">
                  {[
                    { source: "Carbon Trust", desc: "معايير قياس البصمة الكربونية للمؤسسات" },
                    { source: "World Bank", desc: "بيانات الانبعاثات الوطنية والعالمية" },
                    { source: "DEWA", desc: "عوامل انبعاثات الكهرباء في دبي والإمارات" },
                    { source: "EEAA", desc: "بيانات استهلاك الطاقة والمياه في الإمارات" },
                    { source: "FAO", desc: "عوامل انبعاثات الغذاء والزراعة" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: i === 0 ? BRAND.colors.red : i === 1 ? BRAND.colors.gold : BRAND.colors.green }}></div>
                      <div>
                        <span className="font-semibold text-sm">{item.source}</span>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          6. IMPACT & STATS — UAE vision section
         ════════════════════════════════════════════════ */}
      <section id="impact" className="section hero-dark hero-grid relative overflow-hidden">
        <div className="aurora-blob w-[500px] h-[500px] top-1/3 -right-24" style={{ background: 'radial-gradient(circle, rgba(200,169,81,0.1), transparent)' }} />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <SectionLabel>التأثير والإحصائيات</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-black hero-title-gradient mb-4">
              تأثيرك يهم.. نحو مستقبل مستدام
            </h2>
            <div className="divider-uae mb-4"></div>
            <p className="text-lg opacity-70 max-w-2xl mx-auto" style={{ color: '#C8D0E0' }}>
              {BRAND.uaeVision}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {IMPACT_STATS.map((stat, index) => (
              <div key={index} className="card-glass-dark p-8 text-center animate-fade-up" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="text-4xl md:text-5xl font-black hero-title-gradient mb-2">
                  {counts[index]}
                  {stat.value.includes('%') ? '%' : ''}
                  {stat.value === '4' ? '' : ''}
                </div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-xs opacity-50">{stat.unit}</div>
              </div>
            ))}
          </div>

          {/* UAE Vision CTA */}
          <div className="card-glass-dark p-10 md:p-14 rounded-3xl text-center max-w-3xl mx-auto animate-fade-up">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(207,20,43,0.1)' }}>
                <TreePine className="w-8 h-8" style={{ color: BRAND.colors.greenLight }} />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4 hero-title-gradient">
              الإمارات نحو الحياد المناخي 2050
            </h3>
            <p className="opacity-70 mb-8 max-w-xl mx-auto" style={{ color: '#C8D0E0' }}>
              كل خطوة نحو الاستدامة تساهم في تحقيق رؤية الإمارات 2071 
              والوصول إلى الحياد المناخي بحلول 2050. ابدأ رحلتك اليوم.
            </p>
            <button onClick={handleGetStarted} className="btn btn-primary btn-lg text-base px-12">
              ابدأ رحلتك نحو الاستدامة
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          7. FOOTER
         ════════════════════════════════════════════════ */}
      <footer className="border-t border-border bg-background">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-8 w-8 items-center justify-center">
                  <svg viewBox="0 0 40 40" className="h-8 w-8">
                    <defs>
                      <linearGradient id="footerLogo" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#CF142B" />
                        <stop offset="100%" stopColor="#009933" />
                      </linearGradient>
                    </defs>
                    <rect width="40" height="40" rx="10" fill="url(#footerLogo)" />
                    <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                  </svg>
                </span>
                <span className="font-display text-lg font-extrabold">
                  Estidama AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                منصة إماراتية رائدة تستخدم الذكاء الاصطناعي لقياس وتحليل وتقليل البصمة الكربونية.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-bold text-sm mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                {MARKETING_NAV.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* App links */}
            <div>
              <h4 className="font-bold text-sm mb-4">التطبيق</h4>
              <ul className="space-y-2">
                <li><a href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">حاسبة البصمة</a></li>
                <li><a href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">لوحة التحكم</a></li>
                <li><a href="/achievements" className="text-sm text-muted-foreground hover:text-foreground transition-colors">الإنجازات</a></li>
                <li><a href="/challenges" className="text-sm text-muted-foreground hover:text-foreground transition-colors">التحديات</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm mb-4">القانونية</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-foreground">سياسة الخصوصية</span></li>
                <li><span className="text-sm text-muted-foreground">شروط الاستخدام</span></li>
                <li><span className="text-sm text-muted-foreground">منهجية الحساب</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2026 Estidama AI. جميع الحقوق محفوظة.</span>
              <span>🇦🇪 الإمارات العربية المتحدة</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Leaf className="w-4 h-4" style={{ color: BRAND.colors.green }} />
              <span>مدعوم بالذكاء الاصطناعي • نحو مستقبل مستدام</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════
          8. LOGIN MODAL
         ════════════════════════════════════════════════ */}
      {showLoginForm && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLoginForm(false)}
        >
          <div
            className="card-premium p-8 w-[420px] max-w-[92vw] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(207,20,43,0.1), rgba(0,153,51,0.1))' }}>
                <Leaf className="w-8 h-8" style={{ color: BRAND.colors.green }} />
              </div>
              <h2 className="text-2xl font-bold">أهلاً بك في Estidama AI 🌱</h2>
              <p className="text-sm text-muted-foreground mt-2">
                سجّل الدخول لحفظ بصمتك الكربونية ومتابعة تقدمك
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Sign In — Supabase Auth (no Render cold-start) */}
              <button
                type="button"
                onClick={() => void startSupabaseLogin()}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] border"
                style={{ background: '#fff', color: '#1A1A2E', borderColor: '#E5E7EB' }}
              >
                <GoogleIcon />
                المتابعة عبر Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">أو</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Guest / Apple placeholder */}
              <button
                type="button"
                disabled
                title="قريباً"
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold cursor-not-allowed opacity-50 border"
                style={{ background: '#FAFAFA', color: '#1A1A2E', borderColor: '#E5E7EB' }}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1A1A2E" aria-hidden="true">
                  <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.7 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.8zM14.1 5.8c.7-.8 1.1-2 1-3.2-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z" />
                </svg>
                المتابعة عبر Apple (قريباً)
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              أول تسجيل دخول عبر Google يُنشئ حسابك تلقائياً
            </p>

            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="w-full py-2.5 mt-4 rounded-2xl font-bold btn-outline"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
