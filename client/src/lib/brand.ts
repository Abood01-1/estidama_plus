// Central brand + navigation config for Estidama AI.
// Keep product copy and links here so every page stays consistent.

export const BRAND = {
  name: "Estidama AI",
  nameEn: "Estidama AI",
  nameAr: "استدامة",
  tagline: "استدامة مدعومة بالذكاء الاصطناعي",
  taglineEn: "AI-Powered Sustainability",
  description: "منصة إماراتية رائدة تستخدم الذكاء الاصطناعي لقياس وتحليل وتقليل بصمتك الكربونية",
  descriptionEn: "A leading UAE platform using AI to measure, analyze, and reduce your carbon footprint",
  uaeVision: "تماشياً مع رؤية الإمارات 2071 واستراتيجية الحياد المناخي 2050",
  uaeVisionEn: "In line with UAE Vision 2071 and Net Zero 2050",
  heroTitle: "استخدم الذكاء الاصطناعي لفهم بصمتك الكربونية واتخاذ قرارات أكثر استدامة",
  heroSubtitle: "منصة ذكاء اصطناعي إماراتية تساعد الأفراد والمؤسسات على قياس وتحليل وتقليل انبعاثاتهم الكربونية بدقة علمية",
  colors: {
    red: "#CF142B",
    redLight: "#E63950",
    green: "#009933",
    greenLight: "#00CC44",
    gold: "#C8A951",
    goldLight: "#E0C876",
    ink: "#0F0F23",
    white: "#FFFFFF",
  },
} as const;

export type NavLink = { label: string; href: string };

// Landing-page anchor sections.
export const MARKETING_NAV: NavLink[] = [
  { label: "الرئيسية", href: "#hero" },
  { label: "كيف يعمل", href: "#how" },
  { label: "المميزات", href: "#features" },
  { label: "الذكاء الاصطناعي", href: "#ai" },
  { label: "المنهجية", href: "#methodology" },
  { label: "التأثير", href: "#impact" },
];

// Authenticated app sections.
export const APP_NAV: NavLink[] = [
  { label: "لوحة التحكم", href: "/dashboard" },
  { label: "المساعد الذكي", href: "/assistant" },
  { label: "الحاسبة", href: "/calculator" },
  { label: "الإنجازات", href: "/achievements" },
  { label: "التحديات", href: "/challenges" },
  { label: "الملف الشخصي", href: "/profile" },
];

// How it works steps
export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "إنشاء الحساب",
    description: "سجل دخولك عبر Google بخطوة واحدة، وابدأ رحلتك نحو الاستدامة فوراً",
    icon: "UserPlus",
  },
  {
    step: 2,
    title: "إدخال البيانات",
    description: "أدخل معلومات استهلاكك في المواصلات، الكهرباء، المياه، والغذاء",
    icon: "FileInput",
  },
  {
    step: 3,
    title: "تحليل AI",
    description: "يقوم الذكاء الاصطناعي بتحليل بياناتك وحساب بصمتك الكربونية بدقة",
    icon: "Brain",
  },
  {
    step: 4,
    title: "توصيات ذكية",
    description: "احصل على توصيات مخصصة وتتبع تحسنك من خلال لوحة تحكم تفاعلية",
    icon: "TrendingUp",
  },
];

// Features with UAE context
export const FEATURES = [
  {
    title: "قياس دقيق",
    description: "حساب البصمة الكربونية بناءً على معايير EPA و IPCC مع تكييفها للواقع الإماراتي",
    icon: "Target",
    color: "red",
  },
  {
    title: "توصيات AI ذكية",
    description: "نظام توصيات مدعوم بالذكاء الاصطناعي يقدم حلولاً مخصصة حسب نمط حياتك",
    icon: "Sparkles",
    color: "green",
  },
  {
    title: "لوحة تحكم تفاعلية",
    description: "رسوم بيانية متقدمة، مقارنات شهرية، وتتبع مستمر لأدائك البيئي",
    icon: "LayoutDashboard",
    color: "gold",
  },
  {
    title: "مقارنة عالمية",
    description: "قارن بصمتك مع المتوسط الإماراتي والعالمي ورؤية الإمارات 2050",
    icon: "Globe",
    color: "red",
  },
  {
    title: "تحديات ومكافآت",
    description: "نظام تحفيزي مع نقاط ومستويات وتحديات أسبوعية لتحقيق أهداف الاستدامة",
    icon: "Trophy",
    color: "green",
  },
  {
    title: "تقارير PDF",
    description: "إنشاء تقارير احترافية قابلة للمشاركة والطباعة عن بصمتك الكربونية",
    icon: "FileText",
    color: "gold",
  },
];

// Impact statistics
export const IMPACT_STATS = [
  { value: "12", label: "متوسط البصمة في الإمارات", unit: "طن CO₂/سنة" },
  { value: "4", label: "المتوسط العالمي", unit: "طن CO₂/سنة" },
  { value: "50%", label: "هدف خفض الانبعاثات", unit: "بحلول 2035" },
  { value: "2071", label: "مئوية الإمارات", unit: "رؤية مستقبلية" },
];
