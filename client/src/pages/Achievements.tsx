import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BRAND } from "@/lib/brand";
import {
  ArrowLeft, Trophy, Star, Zap, Award, Crown,
  CheckCircle2, Lock, Medal, Sparkles, Target, Users, Gem,
} from "lucide-react";

/* =========================================================================
   Skeleton loaders
   ========================================================================= */

function StatisticsSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-5 animate-pulse">
      {[1,2,3].map((i) => (
        <div key={i} className="card-premium p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
      {[1,2,3,4,5,6].map((i) => (
        <div key={i} className="card-premium p-5 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mb-3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="card-premium overflow-hidden">
      <div className="p-5 space-y-3 animate-pulse">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-14" />
              </div>
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.gamification.getLeaderboard.useQuery({ limit: 10 });
  const { data: allBadges, isLoading: badgesLoading } = trpc.gamification.getAllBadges.useQuery();

  const earnedBadgeIds = new Set(achievements?.badges?.map((b: any) => b.badgeId) || []);

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
                    <linearGradient id="achieveLogo" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#CF142B" />
                      <stop offset="50%" stopColor="#C8A951" />
                      <stop offset="100%" stopColor="#009933" />
                    </linearGradient>
                  </defs>
                  <rect width="40" height="40" rx="10" fill="url(#achieveLogo)" />
                  <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                  <circle cx="27.5" cy="13.5" r="2.8" fill="#fff" />
                </svg>
              </span>
              <span className="font-display font-extrabold text-lg tracking-tight">
                Estidama <span style={{ color: BRAND.colors.red }}>AI</span>
              </span>
            </button>
            <div className="h-5 w-px bg-border mx-1.5" />
            <span className="text-sm text-muted-foreground hidden sm:inline">الإنجازات</span>
          </div>

          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4 ml-1.5" />
            العودة للوحة التحكم
          </Button>
        </div>
      </header>

      <div className="container py-8 space-y-10">
        {/* ════════════════════════════════════════════════
            PAGE HEADER
           ════════════════════════════════════════════════ */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'rgba(200,169,81,0.12)', color: BRAND.colors.gold, border: '1px solid rgba(200,169,81,0.25)' }}>
            <Trophy className="w-3.5 h-3.5" />
            سجل الإنجازات والأوسمة
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">الشارات والإنجازات</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
            اكسب النقاط وافتح الشارات الجديدة من خلال مشاركتك في أنشطة الاستدامة
          </p>
        </div>

        {/* ════════════════════════════════════════════════
            STATISTICS CARDS
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-5">
          <div className="card-premium p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(207,20,43,0.08)' }}>
                <Star className="w-6 h-6" style={{ color: BRAND.colors.red }} />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">إجمالي النقاط المكتسبة</span>
                <div className="text-2xl font-bold mt-0.5" style={{ color: BRAND.colors.red }}>
                  {achievements?.points?.totalPoints?.toLocaleString('ar-AE') || 0}
                </div>
                <span className="text-xs text-muted-foreground">نقطة استدامة</span>
              </div>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,169,81,0.1)' }}>
                <Crown className="w-6 h-6" style={{ color: BRAND.colors.gold }} />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">المستوى الحالي</span>
                <div className="text-2xl font-bold mt-0.5" style={{ color: BRAND.colors.gold }}>
                  المستوى {achievements?.points?.level || 1}
                </div>
                <span className="text-xs text-muted-foreground">سفير استدامة واعد</span>
              </div>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,153,51,0.08)' }}>
                <Zap className="w-6 h-6" style={{ color: BRAND.colors.green }} />
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">الرصيد الحالي</span>
                <div className="text-2xl font-bold mt-0.5" style={{ color: BRAND.colors.green }}>
                  {achievements?.points?.points?.toLocaleString('ar-AE') || 0}
                </div>
                <span className="text-xs text-muted-foreground">جاهز للاستبدال</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            BADGES / ACHIEVEMENTS GRID
           ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">الشارات والأوسمة</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {earnedBadgeIds.size} من أصل {allBadges?.length || 0} شارة مكتسبة
              </p>
            </div>
          </div>

          {badgesLoading ? (
            <BadgesSkeleton />
          ) : allBadges && allBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {allBadges.map((badge: any) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`card-premium p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center ${isEarned ? "hover:shadow-lg hover:-translate-y-1" : "opacity-55 hover:opacity-80"}`}
                    style={{ borderColor: isEarned ? (badge.color || BRAND.colors.gold) : undefined }}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${isEarned ? "" : "grayscale"}`}
                      style={{ background: isEarned ? `${badge.color || BRAND.colors.gold}22` : "rgba(107,114,128,0.1)" }}>
                      <span className="text-3xl">{badge.icon || "🏅"}</span>
                    </div>
                    <div className="text-xs font-semibold leading-tight"
                      style={{ color: isEarned ? (badge.color || BRAND.colors.gold) : undefined }}>
                      {badge.name}
                    </div>
                    {isEarned ? (
                      <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: BRAND.colors.green }}>
                        <CheckCircle2 className="w-3 h-3" />
                        تم الحصول عليها
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        {badge.requirement} {badge.type === 'points' ? 'نقطة' : badge.type === 'reduction' ? '%' : 'تحدي'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card-premium p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Trophy className="w-12 h-12 text-muted-foreground/40" />
                <div>
                  <h3 className="font-semibold text-lg">لا توجد شارات بعد</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    ابدأ رحلتك في الاستدامة لفتح الشارات والمكافآت. كل تحدٍ ونشاط يقرّبك من الشارة التالية.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
            LEADERBOARD
           ════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">لوحة المتصدرين</h2>
          </div>

          {leaderboardLoading ? (
            <LeaderboardSkeleton />
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="card-premium overflow-hidden">
              <div className="divide-y divide-border/50">
                {leaderboard.map((user: any, idx: number) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : rank === 2 ? "bg-gray-50 text-gray-600 border border-gray-200" : rank === 3 ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-transparent text-muted-foreground"}`}>
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">المستخدم {user.userId}</div>
                          <div className="text-xs text-muted-foreground">المستوى {user.level}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: isTop3 ? BRAND.colors.gold : undefined }}>
                          {user.totalPoints?.toLocaleString('ar-AE') || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">نقطة</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card-premium p-8 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">لا توجد بيانات متصدرين حالياً</p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════
          BADGE DETAIL MODAL
         ════════════════════════════════════════════════ */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBadge(null)}>
          <div className="card-premium p-8 max-w-sm w-full mx-auto text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">{selectedBadge.icon || "🏅"}</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: selectedBadge.color || BRAND.colors.ink }}>
              {selectedBadge.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedBadge.description}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(200,169,81,0.1)', color: BRAND.colors.gold, border: '1px solid rgba(200,169,81,0.2)' }}>
              <Target className="w-3 h-3" />
              متطلب: {selectedBadge.requirement} {selectedBadge.type === 'points' ? 'نقطة' : selectedBadge.type === 'reduction' ? '%' : 'تحدي'}
            </div>
            <Button onClick={() => setSelectedBadge(null)} className="w-full" variant="outline">إغلاق</Button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
