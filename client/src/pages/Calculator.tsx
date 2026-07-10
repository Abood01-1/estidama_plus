import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARBON_FACTORS, BENCHMARKS, RATING_LEVELS } from "@shared/carbon-constants";
import { ArrowLeft, Calculator, Leaf, Sparkles, BarChart3, ChevronRight, Check, Brain, TrendingDown, Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function CalculatorPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    carType: "petrol",
    carKmPerYear: 0,
    flightHoursPerYear: 0,
    publicTransportKmPerMonth: 0,
    electricityKwhPerMonth: 0,
    waterM3PerMonth: 0,
    beefKgPerMonth: 0,
    chickenKgPerMonth: 0,
    fishKgPerMonth: 0,
    vegetablesKgPerMonth: 0,
    dairyKgPerMonth: 0,
  });

  const [results, setResults] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const calculateCarbon = () => {
    setCalculating(true);
    
    setTimeout(() => {
      const carEmissions = (formData.carKmPerYear * CARBON_FACTORS.TRANSPORT.car[formData.carType as keyof typeof CARBON_FACTORS.TRANSPORT.car]) / 1000;
      const flightEmissions = (formData.flightHoursPerYear * 11 * CARBON_FACTORS.TRANSPORT.flight.international) / 1000;
      const publicTransportEmissions = (formData.publicTransportKmPerMonth * 12 * CARBON_FACTORS.TRANSPORT.publicTransport.bus) / 1000;
      const transportTotal = carEmissions + flightEmissions + publicTransportEmissions;
      const electricityEmissions = (formData.electricityKwhPerMonth * 12 * CARBON_FACTORS.ELECTRICITY.uae) / 1000;
      const waterEmissions = (formData.waterM3PerMonth * 12 * CARBON_FACTORS.WATER.uae) / 1000;
      const foodEmissions = (
        (formData.beefKgPerMonth * 12 * CARBON_FACTORS.FOOD.beef) +
        (formData.chickenKgPerMonth * 12 * CARBON_FACTORS.FOOD.chicken) +
        (formData.fishKgPerMonth * 12 * CARBON_FACTORS.FOOD.fish) +
        (formData.vegetablesKgPerMonth * 12 * CARBON_FACTORS.FOOD.vegetables) +
        (formData.dairyKgPerMonth * 12 * CARBON_FACTORS.FOOD.dairy)
      ) / 1000;
      const totalCarbon = transportTotal + electricityEmissions + waterEmissions + foodEmissions;

      setResults({
        transport: transportTotal,
        electricity: electricityEmissions,
        water: waterEmissions,
        food: foodEmissions,
        total: totalCarbon,
      });
      setCalculating(false);
      setStep(4);
    }, 1500);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? 0 : Number(value),
    }));
  };

  const getRating = (value: number) => {
    for (const [, rating] of Object.entries(RATING_LEVELS)) {
      if (value >= rating.min && value < rating.max) return rating;
    }
    return RATING_LEVELS.very_high;
  };

  const rating = results ? getRating(results.total) : null;
  const sustainabilityScore = results ? Math.max(0, Math.min(100, Math.round((1 - results.total / 15) * 100))) : 0;

  const steps = [
    { num: 1, label: "المواصلات", icon: "🚗" },
    { num: 2, label: "الطاقة والمياه", icon: "💡" },
    { num: 3, label: "الغذاء", icon: "🍽️" },
    { num: 4, label: "النتائج", icon: "📊" },
  ];

  return (
    <div className="rtl min-h-screen bg-[#FAFAFA] text-foreground">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center">
                <svg viewBox="0 0 40 40" className="h-7 w-7">
                  <rect width="40" height="40" rx="8" fill="url(#calcLogo)" />
                  <path d="M12 27c0-8 6-14 15-15-1 9-7 15-15 15z" fill="#fff" opacity="0.95" />
                  <defs><linearGradient id="calcLogo"><stop offset="0%" stopColor="#CF142B" /><stop offset="100%" stopColor="#009933" /></linearGradient></defs>
                </svg>
              </span>
              <span className="font-display font-extrabold text-base">حاسبة البصمة</span>
            </button>
          </div>
          <Button onClick={() => setLocation("/dashboard")} variant="ghost" className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </header>

      <div className="container py-8">
        {/* Progress Steps */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.slice(0, 3).map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  step === s.num ? 'bg-primary text-white' : step > s.num ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  <span>{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 2 && <div className="w-8 h-px bg-gray-200"></div>}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Transport */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="card-premium p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(207,20,43,0.1)' }}>
                  <Calculator className="w-6 h-6" style={{ color: BRAND.colors.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">المواصلات</h1>
                  <p className="text-sm text-muted-foreground">أدخل بيانات تنقلاتك لحساب البصمة الكربونية</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-2 block">نوع السيارة</Label>
                  <Select value={formData.carType} onValueChange={(value) => handleInputChange("carType", value)}>
                    <SelectTrigger className="input-premium w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">🚗 بنزين</SelectItem>
                      <SelectItem value="diesel">🚙 ديزل</SelectItem>
                      <SelectItem value="hybrid">⚡ هجينة</SelectItem>
                      <SelectItem value="electric">🔋 كهربائية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">كم السيارة السنوي (km)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.carKmPerYear || ""} onChange={(e) => handleInputChange("carKmPerYear", e.target.value)} placeholder="مثال: 15000" />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">ساعات الطيران السنوية</Label>
                  <Input type="number" className="input-premium w-full" value={formData.flightHoursPerYear || ""} onChange={(e) => handleInputChange("flightHoursPerYear", e.target.value)} placeholder="مثال: 20" />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">المواصلات العامة شهرياً (km)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.publicTransportKmPerMonth || ""} onChange={(e) => handleInputChange("publicTransportKmPerMonth", e.target.value)} placeholder="مثال: 100" />
                </div>
              </div>

              <button onClick={() => setStep(2)} className="btn btn-primary w-full mt-8">
                التالي: الطاقة والمياه
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Energy & Water */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="card-premium p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,153,51,0.1)' }}>
                  <BarChart3 className="w-6 h-6" style={{ color: BRAND.colors.green }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">الطاقة والمياه</h1>
                  <p className="text-sm text-muted-foreground">أدخل استهلاكك الشهري من الكهرباء والمياه</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-2 block">استهلاك الكهرباء شهرياً (kWh)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.electricityKwhPerMonth || ""} onChange={(e) => handleInputChange("electricityKwhPerMonth", e.target.value)} placeholder="مثال: 800" />
                  <p className="text-xs text-muted-foreground mt-1">متوسط الاستهلاك في الإمارات: 1000-1500 kWh</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">استهلاك المياه شهرياً (m³)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.waterM3PerMonth || ""} onChange={(e) => handleInputChange("waterM3PerMonth", e.target.value)} placeholder="مثال: 20" />
                  <p className="text-xs text-muted-foreground mt-1">متوسط الاستهلاك في الإمارات: 15-25 m³</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="btn btn-ghost flex-1">السابق</button>
                <button onClick={() => setStep(3)} className="btn btn-primary flex-1">
                  التالي: الغذاء
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Food */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto animate-fade-up">
            <div className="card-premium p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,169,81,0.1)' }}>
                  <Leaf className="w-6 h-6" style={{ color: BRAND.colors.gold }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">الغذاء</h1>
                  <p className="text-sm text-muted-foreground">أدخل استهلاكك الغذائي الشهري</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">لحم البقر (kg/شهر)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.beefKgPerMonth || ""} onChange={(e) => handleInputChange("beefKgPerMonth", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">الدجاج (kg/شهر)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.chickenKgPerMonth || ""} onChange={(e) => handleInputChange("chickenKgPerMonth", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">السمك (kg/شهر)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.fishKgPerMonth || ""} onChange={(e) => handleInputChange("fishKgPerMonth", e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">الخضروات (kg/شهر)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.vegetablesKgPerMonth || ""} onChange={(e) => handleInputChange("vegetablesKgPerMonth", e.target.value)} placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium mb-2 block">منتجات الألبان (kg/شهر)</Label>
                  <Input type="number" className="input-premium w-full" value={formData.dairyKgPerMonth || ""} onChange={(e) => handleInputChange("dairyKgPerMonth", e.target.value)} placeholder="0" />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="btn btn-ghost flex-1">السابق</button>
                <button onClick={calculateCarbon} disabled={calculating} className="btn btn-green flex-1">
                  {calculating ? (
                    <>جاري التحليل...</>
                  ) : (
                    <>حساب البصمة الكربونية <Brain className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && results && (
          <div className="max-w-4xl mx-auto animate-fade-up">
            {/* Result Header */}
            <div className="card-premium p-8 mb-6 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,153,51,0.1)' }}>
                <Check className="w-8 h-8" style={{ color: BRAND.colors.green }} />
              </div>
              <h1 className="text-3xl font-black mb-2">تم حساب بصمتك الكربونية</h1>
              <p className="text-muted-foreground">نتيجة دقيقة بناءً على بياناتك</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Total */}
              <div className="card-stat md:col-span-1">
                <div className="text-sm text-muted-foreground mb-1">إجمالي البصمة</div>
                <div className="text-4xl font-black" style={{ color: BRAND.colors.red }}>{results.total.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">طن CO₂/سنة</div>
              </div>
              {/* Rating */}
              <div className="card-stat">
                <div className="text-sm text-muted-foreground mb-1">التقييم</div>
                <div className="text-2xl font-black mb-1" style={{ color: rating?.color }}>{rating?.label}</div>
                <div className="text-xs text-muted-foreground">مقارنة بالمتوسطات</div>
              </div>
              {/* Sustainability */}
              <div className="card-stat">
                <div className="text-sm text-muted-foreground mb-1">درجة الاستدامة</div>
                <div className="text-2xl font-black mb-1" style={{ color: sustainabilityScore > 50 ? BRAND.colors.green : BRAND.colors.red }}>{sustainabilityScore}/100</div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div className="h-full rounded-full progress-green" style={{ width: `${sustainabilityScore}%` }}></div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="card-premium p-8 mb-6">
              <h2 className="text-xl font-bold mb-6">تفصيل الانبعاثات</h2>
              <div className="space-y-4">
                {[
                  { label: "المواصلات", value: results.transport, color: BRAND.colors.red },
                  { label: "الكهرباء", value: results.electricity, color: BRAND.colors.green },
                  { label: "المياه", value: results.water, color: "#6EC6FF" },
                  { label: "الغذاء", value: results.food, color: BRAND.colors.gold },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span>{item.value.toFixed(2)} طن ({((item.value / results.total) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${(item.value / results.total) * 100}%`, background: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="card-premium p-8 mb-6">
              <h2 className="text-xl font-bold mb-6">المقارنة</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "بصمتك", value: results.total, color: BRAND.colors.red },
                  { label: "المتوسط الإماراتي", value: BENCHMARKS.uae_average, color: BRAND.colors.gold },
                  { label: "المتوسط العالمي", value: BENCHMARKS.global_average, color: BRAND.colors.green },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl text-center" style={{ background: i === 0 ? 'rgba(207,20,43,0.04)' : 'rgba(0,0,0,0.02)', border: `1px solid ${item.color}20` }}>
                    <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-2xl font-black" style={{ color: item.color }}>{item.value.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">طن CO₂/سنة</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="card-premium p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,169,81,0.1)' }}>
                  <Sparkles className="w-5 h-5" style={{ color: BRAND.colors.gold }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">توصيات ذكية</h2>
                  <p className="text-sm text-muted-foreground">مخصصة حسب بياناتك</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(207,20,43,0.04)', border: '1px solid rgba(207,20,43,0.1)' }}>
                  <Zap className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND.colors.red }} />
                  <div>
                    <p className="text-sm font-medium">المواصلات</p>
                    <p className="text-xs text-muted-foreground">استخدام المترو بدل السيارة يومين أسبوعياً يقلل بصمتك حتى 15%</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: 'rgba(0,153,51,0.04)', border: '1px solid rgba(0,153,51,0.1)' }}>
                  <TrendingDown className="w-5 h-5 mt-0.5 shrink-0" style={{ color: BRAND.colors.green }} />
                  <div>
                    <p className="text-sm font-medium">الطاقة</p>
                    <p className="text-xs text-muted-foreground">تركيب ألواح شمسية يوفر حتى 40% من انبعاثات الكهرباء</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => { setResults(null); setStep(1); setFormData({ ...formData, carKmPerYear: 0, flightHoursPerYear: 0, publicTransportKmPerMonth: 0, electricityKwhPerMonth: 0, waterM3PerMonth: 0, beefKgPerMonth: 0, chickenKgPerMonth: 0, fishKgPerMonth: 0, vegetablesKgPerMonth: 0, dairyKgPerMonth: 0 }); }} className="btn btn-ghost">
                حساب جديد
              </Button>
              <Button onClick={() => setLocation("/dashboard")} className="btn btn-primary">
                عرض لوحة التحكم
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
