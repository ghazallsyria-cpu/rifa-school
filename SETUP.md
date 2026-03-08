# مدرسة الرفعة النموذجية — دليل الإعداد

## خطوات Supabase

### 1. تشغيل Schema
```
افتح Supabase Dashboard → SQL Editor
الصق محتوى: supabase/schema.sql
اضغط Run
```

### 2. استيراد الطلاب
```
الصق محتوى: supabase/seed_students.sql
اضغط Run
```

### 3. متغيرات البيئة (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## حسابات الدخول الافتراضية

| الدور | بيانات الدخول | كلمة المرور |
|-------|-------------|-------------|
| مدير | جوال: 55315661 | 55315661 |
| طالب | الرقم المدني | 12345 |
| معلم | رقم الجوال | يحدده المدير |

## خطوات تشغيل المشروع
```bash
npm install
npm run dev
```

## الصفحات المنجزة
- /auth/login — تسجيل دخول بـ 3 أدوار
- /admin — لوحة مدير + إحصاءات
- /admin/teachers — إدارة المعلمين
- /admin/classes — الفصول + تعيين معلمين ومواد
- /admin/grades — تحليل درجات الكل
- /admin/students — جدول الطلاب + درجاتهم
- /teacher — لوحة المعلم
- /teacher/classes — فصوله + طلابه
- /teacher/grades — رصد الدرجات
- /teacher/attendance — تسجيل الحضور
- /teacher/performance — تحليل أداء الطلاب
- /student — لوحة الطالب
- /student/grades — درجاتي
- /student/attendance — حضوري
