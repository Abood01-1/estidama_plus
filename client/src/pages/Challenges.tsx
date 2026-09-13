import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { ArrowLeft, Zap, Target, Clock, Trophy, Sparkles, CheckCircle2, Lock, Flame } from "lucide-react";

const DAILY_CHALLENGES = [
  {
    id: 1,
    title: "تقليل استخدام السيارة",
    description: "استخدم المشي أو الدراجة بدلاً من السيارة لمسافة 5 كم",
    category: "transport",
    reward: 150,
    difficulty: "سهل",
    icon: "🚗",
    progress: 60,
  },
  {
    id: 2,
    title: "توفير الكهرباء",
    description: "قلل استهلاك الكهرباء بنسبة 15% اليوم",
    category: "electricity",
    reward: 200,
    difficulty: "متوسط",
    icon: "💡",
    progress: 40,
  },
  {
    id: 3,
    title: "تناول طعام نباتي",
    description: "تناول وجبة نباتية واحدة على الأقل اليوم",
    category: "food",
    reward: 100,
    difficulty: "سهل",
    icon: "🥗",
    progress: 100,
  },
  {
    id: 4,
    title: "توفير المياه",
    description: "قلل استهلاك المياه بنسبة 20%",
    category: "water",
    reward: 120,
    difficulty: "متوسط",
    icon: "💧",
    progress: 0,
  },
  {
    id: 5,
    title: "إعادة التدوير",
    description: "أعد تدوير 5 عناصر على الأقل",
    category: "waste",
    reward: 180,
    difficulty: "صعب",
    icon: "♻️",
    progress: 20,
  },
  {
    id: 6,
    title: "تحدي الاستدامة الأسبوعي",
    description: "أكمل 5 تحديات يومية متتالية",
    category: "special",
    reward: 500,
    difficulty: "صعب جداً",
    icon: "🏆",
    progress: 80,
  },
];

export default function ChallengesPage() {
  const [, setLocation] = useLocation();

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case "سهل":
        return { bg: "rgba(0,153,51,0.1)", text: BRAND.colors.green, border: "rgba(0,153,51,0.2)" };
      case "متوسط":
        return { bg: "rgba(200,169,81,0.1)", text: BRAND.colors.gold, border: "rgba(200,169,81,0.2)" };
      case "صعب":
        return { bg: "rgba(207,20,43,0.08)", text: BRAND.colors.red, border: "rgba(207,20,43,0.15)" };
      case "صعب جداً":
        return { bg: "rgba(207,20,43,0.12)", text: BRAND.colors.red, border: "rgba(207,20,43,0.25)" };
      default:
        return { bg: "rgba(107,114,128,0.08)", text: "#6B7280", border: "rgba(107,114,128,0.15)" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "transport": return "🚗";
      case "electricity": return "💡";
      case "food": return "🥗";
      case "water": return "💧";
      case "waste": return "♻️";
      case "special": return "🏆";
      default: return "🎯";
    }
  };

  const getStatus = (progress: number) => {
    if (progress >= 100) return { label: "مكتمل", color: BRAND.colors.green, icon: CheckCircle2 };
    if (progress > 0) return { label: "قيد التنفيذ", color: BRAND.colors.gold, icon: Zap };
    return { label: "لم يبدأ", color: "#6B7280", icon: Lock };
  };

  return (
    <div className="rtl min-h-screen bg-background text-foreground">
      {/* ════════════════════════════════════════════════
          HEADER NAVIGATION
         ════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
                  <defs>
                    <linearGradient id="challLogo" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#CF142B" />
                      <stop offset="50%" stopColor="#C8A951" />
                      <stop offset="100%" stopColor="#009933" />
                    </linearGradient>
                  </defs>
                  <rect width="40" height="40" rx="10" fill="url(#challLogo)" />
                  <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                  <circle cx="27.5" cy="13.5" r="2.8" fill="#fff" />
                </svg>
              </span>
              <span className="font-display font-extrabold text-lg tracking-tight">
                Estidama <span style={{ color: BRAND.colors.red }}>AI</span>
              </span>
            </button>
            <div className="h-5 w-px bg-border mx-1.5" />
            <span className="text-sm text-muted-foreground hidden sm:inline">التحديات</span>
          </div>

          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4 ml-1.5" />
            العودة للوحة التحكم
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-10">
        {/* ════════════════════════════════════════════════
            PAGE HEADER
           ════════════════════════════════════════════════ */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'rgba(0,153,51,0.1)', color: BRAND.colors.green, border: '1px solid rgba(0,153,51,0.2)' }}>
            <Flame className="w-3.5 h-3.5" />
            التحديات اليومية والأسبوعية
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">التحديات اليومية</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
            أكمل التحديات اليومية واكسب نقاطاً وشارات جديدة!
          </p>
        </div>

        {/* ════════════════════════════════════════════════
            CHALLENGES GRID
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DAILY_CHALLENGES.map((challenge) => {
            const diffStyle = getDifficultyStyle(challenge.difficulty);
            const StatusIcon = getStatus(challenge.progress).icon;
            const status = getStatus(challenge.progress);
            const isCompleted = challenge.progress >= 100;
            const isLocked = challenge.progress === 0;
            return (
              <div key={challenge.id} className={`card-premium p-5 flex flex-col ${isCompleted ? "border-green-200/50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{challenge.icon}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}` }}>
                    {challenge.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-sm mb-1">{challenge.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{challenge.description}</p>

                <div className="flex items-center gap-1.5 mb-3 text-xs" style={{ color: BRAND.colors.gold }}>
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="font-semibold">{challenge.reward} نقطة</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">التقدم</span>
                    <span className="font-semibold">{challenge.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${challenge.progress}%`,
                        background: challenge.progress >= 100
                          ? `linear-gradient(90deg, ${BRAND.colors.green}, ${BRAND.colors.greenLight})`
                          : `linear-gradient(90deg, ${BRAND.colors.gold}, ${BRAND.colors.goldLight})`,
                      }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: status.color }}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{status.label}</span>
                  </div>
                  <Button className="text-xs h-8 px-4"
                    variant={isCompleted ? "outline" : isLocked ? "secondary" : "default"}
                    disabled={isLocked}>
                    {isCompleted ? "مكتمل ✓" : isLocked ? "مغلق" : "ابدأ التحدي"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════
            WEEKLY CHALLENGE
           ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">التحدي الأسبوعي</h2>
          </div>
          <div className="card-premium p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-5xl mb-3 block">🏆</span>
                <h3 className="text-lg font-bold mb-2">سفير الاستدامة الأسبوعي</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  أكمل 5 تحديات يومية متتالية واحصل على شارة "سفير الاستدامة" و 500 نقطة إضافية!
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: BRAND.colors.gold }}>
                  <Clock className="w-4 h-4" />
                  <span>ينتهي في: 3 أيام</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold">تقدم التحدي الأسبوعي</div>
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5].map((day) => {
                    const done = day <= 3;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? "text-white" : "text-muted-foreground bg-gray-100 border border-border"}`}
                          style={{ background: done ? BRAND.colors.green : undefined }}>
                          {done ? "✓" : day}
                        </div>
                        <span className={`text-xs ${done ? "font-medium" : "text-muted-foreground"}`}>يوم {day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            TIPS SECTION
           ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">نصائح للنجاح</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: "📱", title: "تتبع تقدمك", description: "تحقق من التطبيق يومياً لمعرفة تقدمك في التحديات" },
              { icon: "🎯", title: "ركز على تحدٍ واحد", description: "ابدأ بتحدٍ سهل وانتقل تدريجياً للتحديات الأصعب" },
              { icon: "🤝", title: "شارك مع الأصدقاء", description: "ادعُ أصدقاءك للمشاركة وتنافس معهم" },
              { icon: "🌟", title: "لا تستسلم", description: "كل تحدٍ يقربك من شارة جديدة ومستوى أعلى" },
            ].map((tip, idx) => (
              <div key={idx} className="card-premium p-5 flex items-start gap-4">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
