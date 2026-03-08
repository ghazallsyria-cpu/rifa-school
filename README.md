<div align="center">

# 🏫 مدرسة الرفعة النموذجية
### المنصة التعليمية الرقمية المتكاملة

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?style=for-the-badge&logo=netlify)](https://netlify.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## ✨ المميزات

| الميزة | الوصف |
|--------|-------|
| 🔐 4 أدوار | مدير، معلم، طالب، ولي أمر |
| 📝 اختبارات ذكية | إنشاء، تقديم، تصحيح تلقائي |
| 📚 إدارة الدروس | نص، صور، PDF، فيديو |
| 📋 الواجبات | تكليف، تسليم، تصحيح |
| ✅ الحضور | تسجيل يومي مع تقارير |
| 📊 تقارير وتحليلات | رسوم بيانية شاملة |
| 📢 إعلانات | للمعلمين والطلاب وأولياء الأمور |
| 🌙 وضع مظلم | دعم كامل للثيم الداكن |
| 🎨 تصميم ذهبي | ثيم أسود/ذهبي/أبيض فاخر |

---

## 🚀 التشغيل المحلي

### المتطلبات
- Node.js 18+
- حساب [Supabase](https://supabase.com) مجاني

### الخطوات

```bash
# 1. نسخ المشروع من GitHub
git clone https://github.com/YOUR_USERNAME/rifa-school.git
cd rifa-school

# 2. تثبيت المكتبات
npm install --legacy-peer-deps

# 3. إعداد متغيرات البيئة
cp .env.local.example .env.local
# عدّل الملف وأضف بيانات Supabase

# 4. تشغيل قاعدة البيانات
# افتح Supabase SQL Editor → الصق محتوى supabase/schema.sql → نفّذ

# 5. تشغيل التطبيق
npm run dev
# افتح http://localhost:3000
```

---

## ☁️ الرفع على Netlify

### الطريقة السريعة (Drag & Drop)
1. شغّل `npm run build`
2. ارفع مجلد `.next` على [app.netlify.com/drop](https://app.netlify.com/drop)

### الطريقة الصحيحة (GitHub + Netlify)

1. **أنشئ repository على GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: Initial commit — Rifa School Platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rifa-school.git
   git push -u origin main
   ```

2. **اربط بـ Netlify**:
   - اذهب إلى [app.netlify.com](https://app.netlify.com)
   - اضغط **"Add new site"** → **"Import an existing project"**
   - اختر GitHub وحدد المشروع
   - إعدادات البناء:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - اضغط **Deploy**

3. **أضف متغيرات البيئة في Netlify**:
   - Site settings → Environment variables → أضف:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     NEXT_PUBLIC_APP_URL
     ```

4. **ثبّت Netlify Plugin**:
   - Plugins → ابحث عن **@netlify/plugin-nextjs** → Install

---

## 🗄️ إعداد Supabase

### خطوات الإعداد

1. **أنشئ مشروع جديد** على [app.supabase.com](https://app.supabase.com)

2. **شغّل قاعدة البيانات**:
   - SQL Editor → New query → الصق `supabase/schema.sql` → Run

3. **احصل على المفاتيح**:
   - Settings → API:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

4. **أنشئ حسابات تجريبية**:
   - Authentication → Users → Add user:
     - `admin@rifa.edu` / `admin123` (role: admin)
     - `teacher@rifa.edu` / `teacher123` (role: teacher)
     - `student@rifa.edu` / `student123` (role: student)
     - `parent@rifa.edu` / `parent123` (role: parent)

5. **فعّل Email Auth**:
   - Authentication → Providers → Email → Enable

---

## 🔐 الحسابات التجريبية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| مدير | admin@rifa.edu | admin123 |
| معلم | teacher@rifa.edu | teacher123 |
| طالب | student@rifa.edu | student123 |
| ولي أمر | parent@rifa.edu | parent123 |

---

## 🏗️ هيكل المشروع

```
rifa-school/
├── src/
│   ├── app/
│   │   ├── admin/          # لوحة تحكم المدير
│   │   ├── teacher/        # لوحة المعلم
│   │   ├── student/        # لوحة الطالب
│   │   ├── parent/         # لوحة ولي الأمر
│   │   └── auth/           # تسجيل الدخول
│   ├── components/
│   │   ├── shared/         # Layout, Sidebar, TopBar
│   │   └── ui/             # مكونات واجهة المستخدم
│   ├── hooks/
│   │   └── useAuth.tsx     # نظام المصادقة
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   └── types/
│       └── database.ts     # TypeScript types
├── supabase/
│   └── schema.sql          # Database schema + RLS
├── .github/
│   └── workflows/ci.yml    # GitHub Actions
├── netlify.toml            # Netlify config
└── .env.local.example      # Environment variables
```

---

## 📱 تقنيات المشروع

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Deploy**: Netlify
- **CI/CD**: GitHub Actions

---

<div align="center">
  <p>صُنع بـ ❤️ لمدرسة الرفعة النموذجية</p>
  <p>© 2025 جميع الحقوق محفوظة</p>
</div>
