import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { BENCHMARKS, RATING_LEVELS } from "@shared/carbon-constants";
import { LogOut, Plus, TrendingDown, Target, Trophy, Zap, User, LayoutDashboard, Leaf, Sparkles, ChevronLeft, Calendar, ArrowUp, ArrowDown, Award, Medal, Flame, Sun, Calculator, BarChart3, TrendingUp } from "lucide-react";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [carbonData] = useState({
    transport: 3.5,
    electricity: 2.8,
    water: 0.9,
    food: 2.5,
    waste: 0.3,
  });

  const totalCarbon = Object.values(carbonData).reduce((a, b) => a + b, 0);

  const chartData = [
    { name: "المواصلات", value: carbonData.transport, fill: BRAND.colors.red },
    { name: "الكهرباء", value: carbonData.electricity, fill: BRAND.colors.green },
    { name: "المياه", value: carbonData.water, fill: "#6EC6FF" },
    { name: "الغذاء", value: carbonData.food, fill: BRAND.colors.gold },
    { name: "النفايات", value: carbonData.waste, fill: "#FF6B35" },
  ];

  const monthlyData = [
    { month: "يناير", value: 9.2 },
    { month: "فبراير", value: 8.9 },
    { month: "مارس", value: 9.5 },
    { month: "أبريل", value: 9.1 },
    { month: "مايو", value: 9.0 },
    { month: "يونيو", value: 9.8 },
  ];

  const comparisonData = [
    { name: "بصمتك", value: totalCarbon, fill: BRAND.colors.red },
    { name: "المتوسط الإماراتي", value: BENCHMARKS.uae_average, fill: BRAND.colors.gold },
    { name: "المتوسط العالمي", value: BENCHMARKS.global_average, fill: BRAND.colors.green },
    { name: "الهدف 2050", value: 2, fill: "#6EC6FF" },
  ];

  const getRating = (value: number) => {
    for (const [, rating] of Object.entries(RATING_LEVELS)) {
      if (value >= rating.min && value < rating.max) {
        return rating;
      }
    }
    return RATING_LEVELS.very_high;
  };

  const rating = getRating(totalCarbon);
  const percentageVsUAE = ((totalCarbon / BENCHMARKS.uae_average) * 100).toFixed(1);
  const percentageVsGlobal = ((totalCarbon / BENCHMARKS.global_average) * 100).toFixed(1);

  // Calculate sustainability score (0-100)
  const sustainabilityScore = Math.max(0, Math.min(100, Math.round((1 - totalCarbon / 15) * 100)));

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card-premium p-3 text-sm">
          <p className="font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {Number(entry.value).toFixed(2)} طن
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rtl min-h-screen bg-[#FAFAFA] text-foreground">
      {/* ════════════════════════════════════════════════
          TOP NAV — Dashboard header
         ════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-7 w-7">
                  <rect width="40" height="40" rx="8" fill="url(#dashLogo)" />
                  <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                  <defs><linearGradient id="dashLogo"><stop offset="0%" stopColor="#CF142B" /><stop offset="100%" stopColor="#009933" /></linearGradient></defs>
                </svg>
              </span>
              <span className="font-display font-extrabold text-base">Estidama AI</span>
            </button>
            <div className="h-6 w-px bg-border mx-2"></div>
            <span className="text-sm text-muted-foreground">لوحة التحكم</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Gamification mini display */}
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(200,169,81,0.1)' }}>
                <Award className="w-4 h-4" style={{ color: BRAND.colors.gold }} />
                <span className="font-semibold" style={{ color: BRAND.colors.gold }}>1,250</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,153,51,0.1)' }}>
                <Leaf className="w-4 h-4" style={{ color: BRAND.colors.green }} />
                <span className="font-semibold" style={{ color: BRAND.colors.green }}>المستوى 3</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* ════════════════════════════════════════════════
            PAGE HEADER
           ════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">لوحة التحكم</h1>
            <p className="text-muted-foreground text-sm mt-1">
              تتبع بصمتك الكربونية واحصل على توصيات ذكية
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setLocation("/calculator")} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              حساب جديد
            </Button>
            <Button onClick={() => setLocation("/achievements")} className="btn btn-outline btn-sm">
              <Trophy className="w-4 h-4" />
              الإنجازات
            </Button>
            <Button onClick={() => setLocation("/challenges")} className="btn btn-outline btn-sm">
              <Flame className="w-4 h-4" />
              التحديات
            </Button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            MAIN STATS - 4 columns
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Carbon Score */}
          <div className="card-stat">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">إجمالي البصمة</div>
                <div className="text-3xl font-black">{totalCarbon.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">طن CO₂/سنة</div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(207,20,43,0.08)' }}>
                <Leaf className="w-6 h-6" style={{ color: BRAND.colors.red }} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-red-500">
              <ArrowUp className="w-3 h-3" />
              <span>2% أعلى من الشهر الماضي</span>
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="card-stat">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">درجة الاستدامة</div>
                <div className="text-3xl font-black" style={{ color: sustainabilityScore > 50 ? BRAND.colors.green : BRAND.colors.red }}>
                  {sustainabilityScore}
                </div>
                <div className="text-xs text-muted-foreground">من 100</div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.08)' }}>
                <Sparkles className="w-6 h-6" style={{ color: BRAND.colors.green }} />
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-full rounded-full progress-green" style={{ width: `${sustainabilityScore}%` }}></div>
            </div>
          </div>

          {/* Rating */}
          <div className="card-stat">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">التقييم</div>
                <div className="text-2xl font-black mb-1" style={{ color: rating.color }}>{rating.label}</div>
                <div className="text-xs text-muted-foreground">{rating.min}-{rating.max} طن</div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.08)' }}>
                <Target className="w-6 h-6" style={{ color: rating.color }} />
              </div>
            </div>
          </div>

          {/* UAE Comparison */}
          <div className="card-stat">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">مقابل الإمارات</div>
                <div className="text-3xl font-black" style={{ color: Number(percentageVsUAE) > 100 ? BRAND.colors.red : BRAND.colors.gold }}>
                  {percentageVsUAE}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {totalCarbon > BENCHMARKS.uae_average ? "أعلى من المتوسط" : "أقل من المتوسط"}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,169,81,0.08)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: BRAND.colors.gold }} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: Number(percentageVsGlobal) < 100 ? BRAND.colors.green : BRAND.colors.red }}>
              {Number(percentageVsGlobal) < 100 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
              <span>{Number(percentageVsGlobal)}% من المتوسط العالمي</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            CHARTS ROW - 2 columns
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Emission Distribution - Pie Chart */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">توزيع الانبعاثات</h2>
              <span className="text-xs text-muted-foreground">حسب الفئة</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison - Bar Chart */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">المقارنة</h2>
              <span className="text-xs text-muted-foreground">طن CO₂/سنة</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            MONTHLY TREND + BREAKDOWN
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Monthly Trend - Area Chart (spans 2 cols) */}
          <div className="md:col-span-2 card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">التطور الشهري</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                آخر 6 أشهر
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND.colors.red} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={BRAND.colors.red} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke={BRAND.colors.red} strokeWidth={2} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Breakdown */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold mb-6">تفصيل الانبعاثات</h2>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: item.fill }}></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">طن</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full" style={{ width: `${(item.value / totalCarbon) * 100}%`, background: item.fill }}></div>
                  </div>
                  <div className="text-left text-xs text-muted-foreground mt-0.5">
                    {((item.value / totalCarbon) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            AI RECOMMENDATIONS
           ════════════════════════════════════════════════ */}
        <div className="card-premium p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,169,81,0.1)' }}>
              <Sparkles className="w-5 h-5" style={{ color: BRAND.colors.gold }} />
            </div>
            <div>
              <h2 className="text-xl font-bold">توصيات الذكاء الاصطناعي</h2>
              <p className="text-sm text-muted-foreground">مخصصة حسب بيانات بصمتك الكربونية</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(207,20,43,0.04)', border: '1px solid rgba(207,20,43,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(207,20,43,0.1)' }}>
                  <Zap className="w-4 h-4" style={{ color: BRAND.colors.red }} />
                </div>
                <h3 className="font-bold text-sm">المواصلات</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                استخدم المواصلات العامة أو السيارة الكهربائية. استخدام المترو يوفر حتى 70% من الانبعاثات.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="pill-red">توفير ~1.2 طن/سنة</span>
                <span className="text-muted-foreground">تأثير عالي</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: 'rgba(0,153,51,0.04)', border: '1px solid rgba(0,153,51,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.1)' }}>
                  <Sun className="w-4 h-4" style={{ color: BRAND.colors.green }} />
                </div>
                <h3 className="font-bold text-sm">الطاقة الشمسية</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                تركيب ألواح شمسية يقلل فاتورة الكهرباء وبصمتك الكربونية حتى 40%.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="pill" style={{ background: 'rgba(0,153,51,0.1)', color: BRAND.colors.green }}>توفير ~1.5 طن/سنة</span>
                <span className="text-muted-foreground">استثمار طويل المدى</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: 'rgba(200,169,81,0.04)', border: '1px solid rgba(200,169,81,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,169,81,0.1)' }}>
                  <Leaf className="w-4 h-4" style={{ color: BRAND.colors.gold }} />
                </div>
                <h3 className="font-bold text-sm">النظام الغذائي</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                تقليل استهلاك اللحوم الحمراء واختيار الغذاء المحلي والموسمي.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="pill-gold">توفير ~0.8 طن/سنة</span>
                <span className="text-muted-foreground">صحي ومستدام</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: 'rgba(0,153,51,0.04)', border: '1px solid rgba(0,153,51,0.1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.1)' }}>
                  <TrendingDown className="w-4 h-4" style={{ color: BRAND.colors.green }} />
                </div>
                <h3 className="font-bold text-sm">ترشيد الاستهلاك</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                تقليل استهلاك المياه وإصلاح التسريبات واستخدام أجهزة موفرة للطاقة.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="pill" style={{ background: 'rgba(0,153,51,0.1)', color: BRAND.colors.green }}>توفير ~0.5 طن/سنة</span>
                <span className="text-muted-foreground">سهل التطبيق</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl" style={{ background: 'rgba(207,20,43,0.04)', border: '1px solid rgba(207,20,43,0.1)' }}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND.colors.gold }} />
              <div>
                <p className="text-sm font-medium mb-1">هل تعلم؟</p>
                <p className="text-sm text-muted-foreground">
                  تطبيق هذه التوصيات يمكن أن يقلل بصمتك الكربونية بنسبة تصل إلى 35%، 
                  مما يوفر حوالي 3.5 طن CO₂ سنوياً ويساهم في تحقيق أهداف الإمارات المناخية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            SUSTAINABILITY GOALS + QUICK NAV
           ════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Goals */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">أهداف الاستدامة</h2>
              <span className="text-xs text-muted-foreground">3 أهداف نشطة</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>تقليل البصمة لـ 7 طن</span>
                  <span className="text-muted-foreground">8.4 ← 7.0</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full w-[45%] progress-red"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>استخدام المواصلات العامة مرة أسبوعياً</span>
                  <span className="text-muted-foreground">3/4 أسابيع</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full w-[75%]" style={{ background: 'linear-gradient(90deg, #C8A951, #E0C876)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>توفير 500 كجم CO₂ هذا الشهر</span>
                  <span className="text-muted-foreground">320/500 كجم</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full w-[64%] progress-green"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="card-premium p-6">
            <h2 className="text-lg font-bold mb-6">اختصارات سريعة</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setLocation("/calculator")} className="p-4 rounded-2xl text-right transition-all hover:scale-[1.02]" style={{ background: 'rgba(207,20,43,0.05)', border: '1px solid rgba(207,20,43,0.1)' }}>
                <Calculator className="w-5 h-5 mb-2" style={{ color: BRAND.colors.red }} />
                <div className="font-semibold text-sm">حاسبة البصمة</div>
                <div className="text-xs text-muted-foreground">حساب جديد</div>
              </button>
              <button onClick={() => setLocation("/achievements")} className="p-4 rounded-2xl text-right transition-all hover:scale-[1.02]" style={{ background: 'rgba(200,169,81,0.05)', border: '1px solid rgba(200,169,81,0.1)' }}>
                <Trophy className="w-5 h-5 mb-2" style={{ color: BRAND.colors.gold }} />
                <div className="font-semibold text-sm">الإنجازات</div>
                <div className="text-xs text-muted-foreground">3 شارات جديدة</div>
              </button>
              <button onClick={() => setLocation("/challenges")} className="p-4 rounded-2xl text-right transition-all hover:scale-[1.02]" style={{ background: 'rgba(0,153,51,0.05)', border: '1px solid rgba(0,153,51,0.1)' }}>
                <Flame className="w-5 h-5 mb-2" style={{ color: BRAND.colors.green }} />
                <div className="font-semibold text-sm">التحديات</div>
                <div className="text-xs text-muted-foreground">2 تحديات نشطة</div>
              </button>
              <button onClick={() => setLocation("/profile")} className="p-4 rounded-2xl text-right transition-all hover:scale-[1.02]" style={{ background: 'rgba(110,198,255,0.05)', border: '1px solid rgba(110,198,255,0.1)' }}>
                <User className="w-5 h-5 mb-2" style={{ color: '#6EC6FF' }} />
                <div className="font-semibold text-sm">الملف الشخصي</div>
                <div className="text-xs text-muted-foreground">عرض الإحصائيات</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
