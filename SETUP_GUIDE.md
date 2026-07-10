# دليل تشغيل منصة استدامة+ على جهازك المحلي

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت التقنيات التالية على جهازك:

### 1. **Node.js و npm/pnpm**
- **Node.js**: الإصدار 18 أو أحدث
  - تحميل من: https://nodejs.org/
  - تحقق من التثبيت: `node --version`
  - تحقق من npm: `npm --version`

- **pnpm**: مدير الحزم (أسرع من npm)
  - تثبيت: `npm install -g pnpm`
  - تحقق من التثبيت: `pnpm --version`

### 2. **Git** (اختياري لكن مفيد)
- تحميل من: https://git-scm.com/
- تحقق من التثبيت: `git --version`

### 3. **VS Code** (محرر الأكواد)
- تحميل من: https://code.visualstudio.com/
- ملحقات مفيدة:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin

---

## 🚀 خطوات التشغيل

### الخطوة 1: استخراج الملفات
```bash
# استخرج ملف ZIP
unzip estidama-plus-complete.zip -d estidama-plus
cd estidama-plus
```

### الخطوة 2: تثبيت المكتبات
```bash
# استخدم pnpm (الأسرع والأفضل)
pnpm install

# أو استخدم npm إذا لم تثبت pnpm
npm install
```

### الخطوة 3: إعداد متغيرات البيئة
```bash
# انسخ ملف البيئة النموذجي
cp .env.example .env.local

# أو أنشئ ملف .env.local بالبيانات التالية:
```

**محتوى ملف `.env.local`:**
```

# مفاتيح التطبيق (اختياري - للميزات المتقدمة)
VITE_APP_ID=your_app_id
VITE_APP_TITLE=استدامة+
VITE_APP_LOGO=https://example.com/logo.png
```

### الخطوة 4: تشغيل خادم التطوير
```bash
# تشغيل الخادم والواجهة الأمامية معاً
pnpm dev

# أو بشكل منفصل:
# الخادم: pnpm dev:server
# الواجهة: pnpm dev:client
```

### الخطوة 5: فتح المتصفح
```
http://localhost:3000
```

---

## 📁 هيكل المشروع

```
estidama-plus/
├── client/                    # الواجهة الأمامية (React)
│   ├── src/
│   │   ├── pages/            # الصفحات الرئيسية
│   │   ├── components/       # المكونات المعاد استخدامها
│   │   ├── hooks/            # React hooks مخصصة
│   │   └── lib/              # مكتبات مساعدة
│   └── index.html
├── server/                    # الخادم (Express + tRPC)
│   ├── routers.ts            # نقاط نهاية API
│   ├── db.ts                 # استعلامات قاعدة البيانات
│   ├── gamification.ts       # نظام النقاط والشارات
│   └── recommendations.ts    # نظام التوصيات الذكي
├── drizzle/                   # قاعدة البيانات
│   ├── schema.ts             # تعريف الجداول
│   └── migrations/           # ملفات الهجرة
├── shared/                    # الكود المشترك
│   └── carbon-constants.ts   # ثوابت حسابات البصمة
├── package.json              # المكتبات والإعدادات
└── vite.config.ts            # إعدادات Vite
```

---

## 🛠️ الأوامر الأساسية

```bash
# تشغيل خادم التطوير
pnpm dev

# بناء المشروع للإنتاج
pnpm build

# تشغيل الاختبارات
pnpm test

# فحص الأخطاء
pnpm check

# تنسيق الأكواد
pnpm format

# إنشاء ملف هجرة قاعدة البيانات
pnpm drizzle-kit generate

# تشغيل الهجرات
pnpm db:push
```

---

## 🗄️ إعداد قاعدة البيانات (اختياري)

إذا كنت تريد استخدام قاعدة بيانات محلية:

### 1. تثبيت MySQL
- تحميل من: https://dev.mysql.com/downloads/mysql/
- أو استخدم Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:latest`

### 2. إنشاء قاعدة البيانات
```bash
mysql -u root -p
CREATE DATABASE estidama_plus;
USE estidama_plus;
```

### 3. تطبيق الهجرات
```bash
pnpm db:push
```

### 4. إضافة بيانات الشارات الأولية
```bash
node scripts/seed-badges.mjs
```

---

## 🎮 ميزات المشروع

### الصفحات الرئيسية:
1. **Home** (`/`) - الصفحة الرئيسية
2. **Dashboard** (`/dashboard`) - لوحة التحكم
3. **Calculator** (`/calculator`) - حساب البصمة الكربونية
4. **Achievements** (`/achievements`) - الشارات والإنجازات
5. **Challenges** (`/challenges`) - التحديات اليومية
6. **Profile** (`/profile`) - ملف المستخدم الشخصي

### التقنيات المستخدمة:
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express + tRPC + Node.js
- **Database**: MySQL + Drizzle ORM
- **Build Tool**: Vite
- **Testing**: Vitest
- **UI Components**: shadcn/ui + Recharts

---

## 🐛 حل المشاكل الشائعة

### المشكلة: `pnpm: command not found`
**الحل**: ثبّت pnpm بـ `npm install -g pnpm`

### المشكلة: `Port 3000 already in use`
**الحل**: غيّر المنفذ في `vite.config.ts` أو أغلق البرنامج الذي يستخدم المنفذ

### المشكلة: `Database connection error`
**الحل**: تأكد من أن MySQL يعمل وأن `DATABASE_URL` صحيح في `.env.local`

### المشكلة: `Module not found`
**الحل**: شغّل `pnpm install` مرة أخرى

---

## 📝 ملاحظات مهمة

1. **الملفات الحساسة**: لا تشارك ملف `.env.local` مع أحد
2. **node_modules**: لا تضفها إلى Git (مدرجة في `.gitignore`)
3. **التطوير**: استخدم `pnpm dev` للتطوير المحلي
4. **الإنتاج**: استخدم `pnpm build && pnpm start`

---

## 🚀 النشر (Deployment)

### نشر على Vercel:
```bash
npm i -g vercel
vercel
```

### نشر على Netlify:
```bash
npm i -g netlify-cli
netlify deploy
```

### نشر على خادم خاص:
```bash
pnpm build
# انسخ مجلد dist إلى الخادم
# شغّل: node dist/index.js
```

---

## 📚 موارد إضافية

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Vite Guide](https://vitejs.dev)

---

## 💬 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من ملف `package.json` للتأكد من المكتبات المثبتة
2. اقرأ رسائل الخطأ بعناية
3. جرّب `pnpm install` مرة أخرى
4. احذف `node_modules` و `pnpm-lock.yaml` وأعد التثبيت

---

**تم إنشاء هذا الدليل في**: 9 يوليو 2026
**إصدار المشروع**: 1.0.0
