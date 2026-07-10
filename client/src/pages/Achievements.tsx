import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trophy, Star, Zap, Loader2 } from "lucide-react";

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const { data: achievements, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: leaderboard, isLoading: leaderboardLoading } = trpc.gamification.getLeaderboard.useQuery({ limit: 10 });
  const { data: allBadges, isLoading: badgesLoading } = trpc.gamification.getAllBadges.useQuery();

  const earnedBadgeIds = new Set(achievements?.badges?.map((b: any) => b.badgeId) || []);

  return (
    <div className="rtl min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="backdrop-blur-sm sticky top-0 z-50" style={{ borderBottom: "2px solid #ff007f" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="text-2xl font-bold neon-text-pink">استدامة+</div>
          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="text-neon-cyan">
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
        </div>
      </nav>

      <div className="container py-8">
        {/* Points Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Total Points */}
          <div className="hud-frame p-8">
            <div className="flex items-center gap-4">
              <Star className="w-12 h-12" style={{ color: "#ff007f" }} />
              <div>
                <div className="text-sm" style={{ color: "#00ffff" }}>إجمالي النقاط</div>
                <div className="text-4xl font-black" style={{ color: "#ff007f" }}>
                  {achievements?.points?.totalPoints || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="hud-frame p-8">
            <div className="flex items-center gap-4">
              <Trophy className="w-12 h-12" style={{ color: "#00ffff" }} />
              <div>
                <div className="text-sm" style={{ color: "#00ffff" }}>المستوى</div>
                <div className="text-4xl font-black" style={{ color: "#00ffff" }}>
                  {achievements?.points?.level || 1}
                </div>
              </div>
            </div>
          </div>

          {/* Current Points */}
          <div className="hud-frame p-8">
            <div className="flex items-center gap-4">
              <Zap className="w-12 h-12" style={{ color: "#ff007f" }} />
              <div>
                <div className="text-sm" style={{ color: "#00ffff" }}>النقاط الحالية</div>
                <div className="text-4xl font-black" style={{ color: "#ff007f" }}>
                  {achievements?.points?.points || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8" style={{ color: "#00ffff" }}>
            الشارات والإنجازات
          </h2>
          {badgesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ff007f" }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {allBadges?.map((badge: any) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className="cursor-pointer transform transition hover:scale-110"
                    style={{
                      opacity: isEarned ? 1 : 0.3,
                    }}
                  >
                    <div
                      className="hud-frame p-6 text-center"
                      style={{
                        borderColor: isEarned ? badge.color : "#666",
                        boxShadow: isEarned
                          ? `0 0 20px ${badge.color}, inset 0 0 20px ${badge.color}33`
                          : "none",
                      }}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="text-xs font-bold" style={{ color: badge.color }}>
                        {badge.name}
                      </div>
                      {!isEarned && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {badge.requirement} {badge.type === 'points' ? 'نقطة' : badge.type === 'reduction' ? '%' : 'تحدي'}
                        </div>
                      )}
                      {isEarned && (
                        <div className="text-xs" style={{ color: "#00ffff" }}>✓ تم الحصول عليها</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-3xl font-bold mb-8" style={{ color: "#00ffff" }}>
            لوحة المتصدرين
          </h2>
          <div className="hud-frame p-8">
            {leaderboardLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#ff007f" }} />
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((user: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4"
                    style={{
                      borderLeft: "4px solid #ff007f",
                      backgroundColor: idx === 0 ? "rgba(255, 0, 127, 0.1)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold" style={{ color: "#00ffff" }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: "#ff007f" }}>
                          المستخدم {user.userId}
                        </div>
                        <div className="text-sm" style={{ color: "#00ffff" }}>المستوى {user.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: "#ff007f" }}>
                        {user.totalPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">نقطة</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات متصدرين حالياً
              </div>
            )}
          </div>
        </div>

        {/* Badge Details Modal */}
        {selectedBadge && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer"
            onClick={() => setSelectedBadge(null)}
          >
            <div
              className="hud-frame p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: selectedBadge.color }}>
                  {selectedBadge.name}
                </h3>
                <p style={{ color: "#00ffff" }} className="mb-2">{selectedBadge.description}</p>
                <p className="text-neon-cyan mb-6">
                  متطلب: {selectedBadge.requirement} {selectedBadge.type === 'points' ? 'نقطة' : selectedBadge.type === 'reduction' ? '%' : 'تحدي'}
                </p>
                <Button
                  onClick={() => setSelectedBadge(null)}
                  className="btn-neon w-full"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
