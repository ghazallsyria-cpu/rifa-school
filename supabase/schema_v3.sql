-- ============================================================
-- مدرسة الرفعة النموذجية — Schema v3
-- نظام دخول جديد:
--   الطلاب: رقم مدني + كلمة سر (افتراضي: 12345)
--   المعلمون/الإدارة: رقم موبايل + كلمة سر
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- جدول الموظفين (مدير + معلمون) — دخول برقم الموبايل
-- ============================================================
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,            -- رقم الموبايل = اسم المستخدم
  password TEXT NOT NULL DEFAULT '12345',
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  specialization TEXT,                   -- للمعلم: تخصصه
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الفصول الدراسية
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,                   -- العاشر / الحادي عشر / الثاني عشر
  section TEXT NOT NULL,                 -- 1, 2, 3 ...
  track TEXT NOT NULL DEFAULT 'عام',    -- علمي / أدبي / عام
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الطلاب — دخول بالرقم المدني
-- ============================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  national_id TEXT UNIQUE NOT NULL,      -- الرقم المدني = اسم المستخدم
  full_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  grade TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'عام',
  section TEXT NOT NULL DEFAULT '1',
  password TEXT NOT NULL DEFAULT '12345',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- أولياء الأمور
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL DEFAULT '12345',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ربط ولي الأمر بالطلاب
CREATE TABLE IF NOT EXISTS public.parent_students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'ولي أمر',
  UNIQUE(parent_id, student_id)
);

-- ============================================================
-- المواد الدراسية
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الواجبات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homework (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- تسليم الواجبات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homework_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  homework_id UUID REFERENCES public.homework(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  content TEXT,
  grade NUMERIC(5,2),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(homework_id, student_id)
);

-- ============================================================
-- الغياب والحضور
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('حاضر', 'غائب', 'متأخر', 'إذن')),
  notes TEXT,
  recorded_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ============================================================
-- الإعلانات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('all','student','teacher','parent')),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الدرجات / الامتحانات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('اختبار قصير', 'منتصف الفصل', 'نهاية الفصل', 'واجب', 'مشاركة')),
  score NUMERIC(5,2),
  max_score NUMERIC(5,2) DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- الجدول الدراسي
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس')),
  period INTEGER NOT NULL CHECK (period BETWEEN 1 AND 8),
  start_time TIME,
  end_time TIME,
  UNIQUE(class_id, day_of_week, period)
);

-- ============================================================
-- بيانات جلسات تسجيل الدخول (اختياري - للتتبع)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.login_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff', 'parent')),
  user_id UUID NOT NULL,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_national_id ON public.students(national_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_staff_phone ON public.staff(phone);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON public.grades(student_id);

-- ============================================================
-- إدراج المدير الافتراضي
-- ============================================================
INSERT INTO public.staff (full_name, phone, password, role, is_active)
VALUES ('مدير المدرسة', '55315661', '55315661', 'admin', true)
ON CONFLICT (phone) DO UPDATE SET password = EXCLUDED.password;

-- ============================================================
-- الفصول الدراسية 2025-2026
-- ============================================================
INSERT INTO public.classes (id, name, grade, section, track, academic_year) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'الصف الثاني عشر - علمي - شعبة 1', 'الثاني عشر', '1', 'علمي', '2025-2026'),
  ('a0000001-0000-0000-0000-000000000002', 'الصف الثاني عشر - علمي - شعبة 2', 'الثاني عشر', '2', 'علمي', '2025-2026'),
  ('a0000001-0000-0000-0000-000000000003', 'الصف الثاني عشر - علمي - شعبة 3', 'الثاني عشر', '3', 'علمي', '2025-2026'),
  ('a0000001-0000-0000-0000-000000000004', 'الصف الثاني عشر - علمي - شعبة 4', 'الثاني عشر', '4', 'علمي', '2025-2026'),
  ('a0000001-0000-0000-0000-000000000005', 'الصف الثاني عشر - علمي - شعبة 5', 'الثاني عشر', '5', 'علمي', '2025-2026'),
  ('a0000001-0000-0000-0000-000000000006', 'الصف الثاني عشر - أدبي - شعبة 1', 'الثاني عشر', '1', 'أدبي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000001', 'الصف الحادي عشر - علمي - شعبة 1', 'الحادي عشر', '1', 'علمي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000002', 'الصف الحادي عشر - علمي - شعبة 2', 'الحادي عشر', '2', 'علمي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000003', 'الصف الحادي عشر - علمي - شعبة 3', 'الحادي عشر', '3', 'علمي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000004', 'الصف الحادي عشر - علمي - شعبة 4', 'الحادي عشر', '4', 'علمي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000005', 'الصف الحادي عشر - علمي - شعبة 5', 'الحادي عشر', '5', 'علمي', '2025-2026'),
  ('a0000002-0000-0000-0000-000000000006', 'الصف الحادي عشر - أدبي - شعبة 1', 'الحادي عشر', '1', 'أدبي', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000001', 'الصف العاشر - شعبة 1', 'العاشر', '1', 'عام', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000002', 'الصف العاشر - شعبة 2', 'العاشر', '2', 'عام', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000003', 'الصف العاشر - شعبة 3', 'العاشر', '3', 'عام', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000004', 'الصف العاشر - شعبة 4', 'العاشر', '4', 'عام', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000005', 'الصف العاشر - شعبة 5', 'العاشر', '5', 'عام', '2025-2026'),
  ('a0000003-0000-0000-0000-000000000006', 'الصف العاشر - شعبة 6', 'العاشر', '6', 'عام', '2025-2026')
ON CONFLICT (id) DO NOTHING;
