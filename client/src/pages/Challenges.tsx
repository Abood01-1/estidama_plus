import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Zap, Trophy, Sparkles, CheckCircle2, Lock, Flame, Coins } from "lucide-react";

export default function ChallengesPage() {
  const [, setLocation] = useLocation();
  const [feedback, setFeedback] = useState<string | null>(null);

  const daily = trpc.gamification.getDailyChallenges.useQuery();
  const eco = trpc.gamification.getEcoCoins.useQuery();
  const utils = trpc.useUtils();
  const startMutation = trpc.gamification.startChallenge.useMutation({
    onSuccess: () => { void utils.gamification.getDailyChallenges.invalidate(); },
  });
  const progressMutation = trpc.gamification.updateChallengeProgress.useMutation({
    onSuccess: () => { void utils.gamification.getDailyChallenges.invalidate(); },
  });
  const completeMutation = trpc.gamification.completeChallenge.useMutation({
    onSuccess: (data) => {
      void utils.gamification.getDailyChallenges.invalidate();
      void utils.gamification.getEcoCoins.invalidate();
      void utils.gamification.getEcoTransactions.invalidate();
      if (data.completed && !data.alreadyCompleted) {
        setFeedback(`أحسنت! ربحت ${data.coinsEarned} عملة بيئية. السلسلة الحالية: ${data.streak}`);
      } else if (data.alreadyCompleted) {
        setFeedback("هذا التحدي مكتمل مسبقاً وتمت مكافأته.");
      } else {
        setFeedback("أكمل تقدم التحدي إلى 100% أولاً.");
      }
    },
    onError: (err) => setFeedback(err.message),
  });

  const challenges = daily.data?.challenges ?? [];
  const streak = daily.data?.streak ?? eco.data?.streak ?? 0;
  const balance = daily.data?.balance ?? eco.data?.balance ?? 0;

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
            ECO COINS + STREAK SUMMARY (same layout, real data)
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card-premium p-5 flex items-center gap-4">
            <span className="text-3xl"><Coins className="w-8 h-8" style={{ color: BRAND.colors.gold }} /></span>
            <div>
              <div className="text-xs text-muted-foreground">رصيد العملات البيئية</div>
              <div className="text-2xl font-bold">{eco.isLoading ? "…" : balance}</div>
            </div>
          </div>
          <div className="card-premium p-5 flex items-center gap-4">
            <span className="text-3xl"><Flame className="w-8 h-8" style={{ color: BRAND.colors.red }} /></span>
            <div>
              <div className="text-xs text-muted-foreground">السلسلة الحالية (أيام متتالية)</div>
              <div className="text-2xl font-bold">{daily.isLoading ? "…" : streak}</div>
            </div>
          </div>
        </div>
        {feedback && (
          <div className="card-premium p-4 text-sm font-medium" role="status">{feedback}</div>
        )}

        {/* ════════════════════════════════════════════════
            CHALLENGES GRID (same cards, tRPC data)
           ════════════════════════════════════════════════ */}
        {daily.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (<div key={i} className="card-premium p-5 h-48" />))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="card-premium p-8 text-center text-sm text-muted-foreground">لا توجد تحديات نشطة اليوم</div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((challenge) => {
            const diffStyle = getDifficultyStyle(challenge.difficulty);
            const StatusIcon = getStatus(challenge.progress).icon;
            const status = getStatus(challenge.progress);
            const isCompleted = challenge.completed || challenge.progress >= 100;
            const isLocked = challenge.progress === 0;
            const busy = startMutation.isPending || progressMutation.isPending || completeMutation.isPending;
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
                  <span className="font-semibold">{challenge.reward} عملة بيئية</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">التقدم</span>
                    <span className="font-semibold">{challenge.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(challenge.progress, 100)}%`,
                        background: challenge.progress >= 100
                          ? `linear-gradient(90deg, ${BRAND.colors.green}, ${BRAND.colors.greenLight})`
                          : `linear-gradient(90deg, ${BRAND.colors.gold}, ${BRAND.colors.goldLight})`,
                      }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto gap-2">
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: status.color }}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{isCompleted ? "مكتمل" : status.label}</span>
                  </div>
                  {isCompleted ? (
                    <Button className="text-xs h-8 px-4" variant="outline" disabled>مكتمل ✓</Button>
                  ) : isLocked ? (
                    <Button className="text-xs h-8 px-4" variant="secondary" disabled={busy}
                      onClick={() => startMutation.mutate({ challengeId: challenge.id })}>ابدأ التحدي</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="text-xs h-8 px-3" variant="secondary" disabled={busy}
                        onClick={() => progressMutation.mutate({ challengeId: challenge.id, progress: 100 })}>تسجيل التقدم</Button>
                      <Button className="text-xs h-8 px-3" variant="default" disabled={busy}
                        onClick={() => completeMutation.mutate({ challengeId: challenge.id })}>إتمام</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

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
                  <Sparkles className="w-4 h-4" />
                  <span>السلسلة الحالية: {streak} أيام متتالية</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold">تقدم التحدي الأسبوعي (السلسلة الحقيقية: {streak})</div>
                <div className="space-y-2.5">
                  {[1, 2, 3, 4, 5].map((day) => {
                    const done = day <= Math.min(streak, 5);
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
