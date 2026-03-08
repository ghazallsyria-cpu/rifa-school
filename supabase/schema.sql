-- ============================================================
-- مدرسة الرفعة النموذجية — Schema v3
-- نظام دخول: رقم مدني للطلاب | رقم جوال للمعلمين والإدارة
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. لوحة المدير
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'مدير النظام',
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- المدير الافتراضي
INSERT INTO public.admin_profiles (full_name, phone, password_hash)
VALUES ('مدير النظام', '55315661', '55315661')
ON CONFLICT (phone) DO NOTHING;

-- ============================================================
-- 2. المعلمون
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  subject TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. الفصول الدراسية
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'عام',
  academic_year TEXT NOT NULL DEFAULT '2025-2026',
  teacher_id UUID REFERENCES public.teacher_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. الطلاب — الدخول بالرقم المدني
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
  national_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  grade TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'عام',
  section TEXT NOT NULL DEFAULT '1',
  password_hash TEXT NOT NULL DEFAULT '12345',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. الحضور والغياب
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_national_id TEXT REFERENCES public.student_profiles(national_id),
  class_id UUID REFERENCES public.classes(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('حاضر', 'غائب', 'متأخر', 'مستأذن')) DEFAULT 'حاضر',
  notes TEXT,
  recorded_by UUID REFERENCES public.teacher_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_national_id, date)
);

-- ============================================================
-- 6. الواجبات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.homework (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id),
  teacher_id UUID REFERENCES public.teacher_profiles(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. الاختبارات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id),
  teacher_id UUID REFERENCES public.teacher_profiles(id),
  exam_date DATE,
  total_marks INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. الدرجات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_national_id TEXT REFERENCES public.student_profiles(national_id),
  exam_id UUID REFERENCES public.exams(id),
  marks_obtained DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_national_id, exam_id)
);

-- ============================================================
-- 9. الإعلانات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT CHECK (target_role IN ('all', 'student', 'teacher', 'admin')) DEFAULT 'all',
  created_by_admin UUID REFERENCES public.admin_profiles(id),
  created_by_teacher UUID REFERENCES public.teacher_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Triggers for updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_updated BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_teacher_updated BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_student_updated BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS Policies (disable for simplicity, enable per need)
-- ============================================================
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow all for service role (API calls)
CREATE POLICY "service_all" ON public.admin_profiles FOR ALL USING (true);
CREATE POLICY "service_all" ON public.teacher_profiles FOR ALL USING (true);
CREATE POLICY "service_all" ON public.student_profiles FOR ALL USING (true);
CREATE POLICY "service_all" ON public.classes FOR ALL USING (true);
CREATE POLICY "service_all" ON public.attendance FOR ALL USING (true);
CREATE POLICY "service_all" ON public.homework FOR ALL USING (true);
CREATE POLICY "service_all" ON public.exams FOR ALL USING (true);
CREATE POLICY "service_all" ON public.grades FOR ALL USING (true);
CREATE POLICY "service_all" ON public.announcements FOR ALL USING (true);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_student_national_id ON public.student_profiles(national_id);
CREATE INDEX IF NOT EXISTS idx_student_class ON public.student_profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_phone ON public.teacher_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_admin_phone ON public.admin_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_national_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_classes_grade ON public.classes(grade, track, section);

-- ============================================================
-- جداول إضافية: المواد + تعيين المعلمين للفصول
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ربط المعلم بالصف مع المادة
CREATE TABLE IF NOT EXISTS public.teacher_class_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_year TEXT DEFAULT '2025-2026',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, class_id, subject_id)
);

CREATE POLICY "service_all" ON public.subjects FOR ALL USING (true);
CREATE POLICY "service_all" ON public.teacher_class_subjects FOR ALL USING (true);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_class_subjects ENABLE ROW LEVEL SECURITY;

-- الدرجات مع المادة والنوع
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id);
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'اختبار';
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'الفصل الأول';
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS max_marks DECIMAL(5,2) DEFAULT 100;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teacher_profiles(id);

-- ============================================================
-- Seed: المواد الدراسية الافتراضية
-- ============================================================
INSERT INTO public.subjects (name) VALUES
  ('القرآن الكريم'),('التفسير'),('التوحيد'),('الفقه'),('الحديث'),
  ('اللغة العربية'),('النحو والصرف'),('البلاغة'),('الأدب والنصوص'),
  ('اللغة الإنجليزية'),('الرياضيات'),('الفيزياء'),('الكيمياء'),
  ('الأحياء'),('علم الأرض'),('التاريخ'),('الجغرافيا'),
  ('الاجتماعيات'),('الحاسب الآلي'),('التربية الوطنية'),
  ('التربية البدنية'),('الفنون'),('المهارات الحياتية')
ON CONFLICT DO NOTHING;

-- ============================================================
-- جدول الإشعارات
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('exam','homework','announcement','attendance','grade','general')) DEFAULT 'general',
  target_role TEXT CHECK (target_role IN ('all','student','teacher','admin')) DEFAULT 'all',
  target_class_id UUID REFERENCES public.classes(id),
  target_student_id TEXT REFERENCES public.student_profiles(national_id),
  sent_by_admin UUID REFERENCES public.admin_profiles(id),
  sent_by_teacher UUID REFERENCES public.teacher_profiles(id),
  is_read BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all" ON public.notifications FOR ALL USING (true);
CREATE POLICY "service_all" ON public.notification_reads FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_role ON public.notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_class ON public.notifications(target_class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
