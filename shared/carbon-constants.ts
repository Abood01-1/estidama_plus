/**
 * ثوابت وحسابات البصمة الكربونية بناءً على معايير علمية معتمدة
 * المراجع: EPA, IPCC, Carbon Trust, World Bank
 */

export const CARBON_FACTORS = {
  // المواصلات (kg CO₂ per km)
  TRANSPORT: {
    car: {
      petrol: 0.21, // سيارة بنزين
      diesel: 0.18, // سيارة ديزل
      hybrid: 0.12, // سيارة هجينة
      electric: 0.05, // سيارة كهربائية
    },
    flight: {
      domestic: 0.255, // رحلة محلية
      international: 0.195, // رحلة دولية
    },
    publicTransport: {
      bus: 0.089, // حافلة
      metro: 0.041, // مترو
      taxi: 0.192, // تاكسي
    },
    walking: 0, // مشي
    cycling: 0, // دراجة
  },

  // الكهرباء (kg CO₂ per kWh)
  ELECTRICITY: {
    uae: 0.55, // شبكة الكهرباء الإماراتية (تقريباً)
    global_average: 0.41,
    renewable: 0.05,
  },

  // المياه (kg CO₂ per m³)
  WATER: {
    uae: 0.75, // تحلية المياه في الإمارات
    global_average: 0.34,
  },

  // الغذاء (kg CO₂ per kg)
  FOOD: {
    beef: 27.0, // لحم البقر
    lamb: 24.0, // لحم الضأن
    cheese: 23.5, // جبن
    pork: 12.1, // لحم الخنزير
    chicken: 6.9, // دجاج
    fish: 5.0, // سمك
    eggs: 4.8, // بيض
    rice: 2.7, // أرز
    wheat: 1.4, // قمح
    beans: 0.4, // فول
    vegetables: 0.5, // خضروات
    fruits: 0.5, // فواكه
    dairy: 1.9, // منتجات ألبان
  },

  // النفايات (kg CO₂ per kg)
  WASTE: {
    general: 0.5,
    organic: 0.2,
    plastic: 6.0,
    paper: 1.5,
  },
};

// المتوسطات الوطنية والعالمية
export const BENCHMARKS = {
  uae_average: 12.0, // ton CO₂/year
  global_average: 4.0, // ton CO₂/year
  developed_countries: 8.0, // ton CO₂/year
  developing_countries: 2.0, // ton CO₂/year
};

// الفئات الرئيسية للبصمة الكربونية
export const CATEGORIES = {
  transport: 'المواصلات',
  electricity: 'الكهرباء والطاقة',
  water: 'المياه',
  food: 'الغذاء',
  waste: 'النفايات',
};

// نصائح تقليل الانبعاثات (باللغة العربية)
export const REDUCTION_TIPS = {
  transport: [
    'استخدم المواصلات العامة بدلاً من السيارة الخاصة',
    'اختر السيارات الكهربائية أو الهجينة',
    'قلل من رحلات الطيران أو استخدم الرحلات المباشرة',
    'استخدم الدراجة أو المشي للمسافات القريبة',
    'شارك السيارة مع الآخرين (Carpooling)',
  ],
  electricity: [
    'استخدم الطاقة الشمسية في المنزل',
    'قلل من استخدام مكيف الهواء',
    'استخدم الأجهزة الموفرة للطاقة',
    'أطفئ الأجهزة عند عدم الاستخدام',
    'استخدم إضاءة LED بدلاً من المصابيح التقليدية',
  ],
  water: [
    'قلل من استهلاك المياه في الاستحمام',
    'أصلح التسريبات في المنزل',
    'استخدم تقنيات الري الحديثة',
    'أعد استخدام المياه (Recycling)',
  ],
  food: [
    'قلل من استهلاك اللحوم الحمراء',
    'اختر الغذاء المحلي والموسمي',
    'تجنب الأطعمة المستوردة من مسافات بعيدة',
    'قلل من الأطعمة المصنعة',
    'اتبع نظاماً غذائياً نباتياً أو شبه نباتي',
  ],
  waste: [
    'قلل من المشتريات غير الضرورية',
    'أعد تدوير النفايات',
    'استخدم أكياساً قابلة لإعادة الاستخدام',
    'تجنب المنتجات ذات التغليف الزائد',
    'تبرع بالأشياء القديمة بدلاً من رميها',
  ],
};

// درجات تقييم البصمة الكربونية
export const RATING_LEVELS = {
  excellent: { min: 0, max: 2, label: 'ممتاز', color: '#00ff00' },
  good: { min: 2, max: 4, label: 'جيد', color: '#00ffff' },
  average: { min: 4, max: 8, label: 'متوسط', color: '#ffff00' },
  high: { min: 8, max: 12, label: 'مرتفع', color: '#ff6600' },
  very_high: { min: 12, max: Infinity, label: 'مرتفع جداً', color: '#ff0000' },
};
