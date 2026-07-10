import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Target, Clock } from "lucide-react";

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "سهل":
        return "#00ff7f";
      case "متوسط":
        return "#ffff00";
      case "صعب":
        return "#ff6600";
      case "صعب جداً":
        return "#ff0000";
      default:
        return "#00ffff";
    }
  };

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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4" style={{ color: "#00ffff" }}>
            التحديات اليومية
          </h1>
          <p style={{ color: "#b3b3b3" }}>
            أكمل التحديات اليومية واكسب نقاطاً وشارات جديدة!
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAILY_CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="hud-frame p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{challenge.icon}</div>
                <div
                  className="px-3 py-1 rounded text-xs font-bold"
                  style={{
                    backgroundColor: getDifficultyColor(challenge.difficulty) + "33",
                    color: getDifficultyColor(challenge.difficulty),
                    border: `1px solid ${getDifficultyColor(challenge.difficulty)}`,
                  }}
                >
                  {challenge.difficulty}
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-lg font-bold mb-2" style={{ color: "#ff007f" }}>
                {challenge.title}
              </h3>
              <p className="text-sm mb-4" style={{ color: "#b3b3b3" }}>
                {challenge.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "#00ffff" }}>التقدم</span>
                  <span className="text-xs font-bold" style={{ color: "#ff007f" }}>
                    {challenge.progress}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded"
                  style={{
                    backgroundColor: "#333",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${challenge.progress}%`,
                      background: `linear-gradient(90deg, #ff007f, #00ffff)`,
                    }}
                  />
                </div>
              </div>

              {/* Reward and Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: "#ffff00" }} />
                  <span className="font-bold" style={{ color: "#ffff00" }}>
                    +{challenge.reward}
                  </span>
                </div>
                <Button
                  className="btn-neon text-sm"
                  disabled={challenge.progress < 100}
                >
                  {challenge.progress === 100 ? "مكتمل ✓" : "قيد التقدم"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Challenge Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#00ffff" }}>
            التحدي الأسبوعي
          </h2>
          <div
            className="hud-frame p-8"
            style={{
              background: "linear-gradient(135deg, rgba(255,0,127,0.1) 0%, rgba(0,255,255,0.1) 100%)",
            }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#ff007f" }}>
                  سفير الاستدامة الأسبوعي
                </h3>
                <p className="mb-4" style={{ color: "#b3b3b3" }}>
                  أكمل 5 تحديات يومية متتالية واحصل على شارة "سفير الاستدامة" و 500 نقطة إضافية!
                </p>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5" style={{ color: "#00ffff" }} />
                  <span style={{ color: "#00ffff" }}>ينتهي في: 3 أيام</span>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: day <= 3 ? "#ff007f" : "#333",
                          color: day <= 3 ? "#000" : "#666",
                        }}
                      >
                        {day <= 3 ? "✓" : day}
                      </div>
                      <span>يوم {day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#00ffff" }}>
            نصائح للنجاح
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "📱",
                title: "تتبع تقدمك",
                description: "تحقق من التطبيق يومياً لمعرفة تقدمك في التحديات",
              },
              {
                icon: "🎯",
                title: "ركز على تحدٍ واحد",
                description: "ابدأ بتحدٍ سهل وانتقل تدريجياً للتحديات الأصعب",
              },
              {
                icon: "🤝",
                title: "شارك مع الأصدقاء",
                description: "ادعُ أصدقاءك للمشاركة وتنافس معهم",
              },
              {
                icon: "🌟",
                title: "لا تستسلم",
                description: "كل تحدٍ يقربك من شارة جديدة ومستوى أعلى",
              },
            ].map((tip, idx) => (
              <div key={idx} className="hud-frame p-6">
                <div className="text-4xl mb-3">{tip.icon}</div>
                <h4 className="font-bold mb-2" style={{ color: "#ff007f" }}>
                  {tip.title}
                </h4>
                <p className="text-sm" style={{ color: "#b3b3b3" }}>
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
