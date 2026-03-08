"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Badge, Modal, StatCard } from "@/components/ui/index";
import { Plus, Search, PenTool, Clock, Users, Award, Eye, Edit, Trash2, Play } from "lucide-react";

const mockExams = [
  { id: "1", title: "اختبار الرياضيات الشهري", subject: "رياضيات", class: "الصف الأول أ", teacher: "أ. محمد أحمد", duration: 60, questions: 20, maxGrade: 100, startTime: "2024-03-15 09:00", status: "active", submissions: 28 },
  { id: "2", title: "اختبار قصة الأيام", subject: "عربي", class: "الصف الثاني ب", teacher: "أ. فاطمة علي", duration: 45, questions: 15, maxGrade: 50, startTime: "2024-03-16 11:00", status: "scheduled", submissions: 0 },
  { id: "3", title: "الاختبار النهائي - علوم", subject: "علوم", class: "الصف الثالث أ", teacher: "أ. خالد إبراهيم", duration: 90, questions: 30, maxGrade: 100, startTime: "2024-03-10 08:00", status: "completed", submissions: 35 },
  { id: "4", title: "اختبار الإنجليزي التجريبي", subject: "إنجليزي", class: "الصف الأول ب", teacher: "أ. سارة محمود", duration: 30, questions: 10, maxGrade: 30, startTime: "2024-03-20 10:00", status: "draft", submissions: 0 },
];

const statusLabels: Record<string, { label: string; variant: "success" | "info" | "warning" | "default" }> = {
  active: { label: "نشط", variant: "success" },
  scheduled: { label: "مجدول", variant: "info" },
  completed: { label: "منتهي", variant: "default" },
  draft: { label: "مسودة", variant: "warning" },
};

export default function AdminExams() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = mockExams.filter(e => e.title.includes(search) || e.subject.includes(search));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">إدارة الاختبارات 📝</h1>
            <p className="page-subtitle">إنشاء وإدارة اختبارات المدرسة</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 btn-primary text-sm py-2.5">
            <Plus size={16} /> إنشاء اختبار
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="اختبارات نشطة" value="3" icon={<Play size={20} />} color="green" />
          <StatCard title="مجدولة" value="2" icon={<Clock size={20} />} color="blue" />
          <StatCard title="منتهية" value="18" icon={<Award size={20} />} color="gold" />
          <StatCard title="إجمالي المشاركات" value="486" icon={<Users size={20} />} color="purple" />
        </div>

        {/* Search */}
        <Card>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="search" placeholder="البحث عن اختبار..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pr-9 py-2" />
            </div>
            <select className="input-field py-2 w-40">
              <option>جميع الحالات</option>
              <option>نشط</option>
              <option>مجدول</option>
              <option>منتهي</option>
            </select>
          </div>
        </Card>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((exam) => {
            const status = statusLabels[exam.status];
            return (
              <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm card-hover overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{exam.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exam.subject} · {exam.class}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-xl p-2.5">
                      <div className="text-lg font-black text-gray-800 dark:text-gray-100">{exam.duration}</div>
                      <div className="text-[10px] text-gray-400">دقيقة</div>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-xl p-2.5">
                      <div className="text-lg font-black text-gray-800 dark:text-gray-100">{exam.questions}</div>
                      <div className="text-[10px] text-gray-400">سؤال</div>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-xl p-2.5">
                      <div className="text-lg font-black text-gray-800 dark:text-gray-100">{exam.submissions}</div>
                      <div className="text-[10px] text-gray-400">تسليم</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>👨‍🏫 {exam.teacher}</span>
                    <span>🕐 {new Date(exam.startTime).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Eye size={13} /> عرض
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-medium hover:bg-primary-100 transition-colors">
                      <Edit size={13} /> تعديل
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Exam Modal */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إنشاء اختبار جديد" size="xl">
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setShowCreate(false); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">عنوان الاختبار *</label>
                <input type="text" className="input-field" placeholder="أدخل عنوان الاختبار" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">المادة *</label>
                <select className="input-field" required>
                  <option value="">اختر المادة</option>
                  <option>رياضيات</option>
                  <option>عربي</option>
                  <option>علوم</option>
                  <option>إنجليزي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الفصل الدراسي *</label>
                <select className="input-field" required>
                  <option value="">اختر الفصل</option>
                  <option>الصف الأول أ</option>
                  <option>الصف الثاني ب</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">مدة الاختبار (دقيقة) *</label>
                <input type="number" min="5" max="300" className="input-field text-left" dir="ltr" placeholder="60" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الدرجة القصوى *</label>
                <input type="number" min="1" className="input-field text-left" dir="ltr" placeholder="100" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">تاريخ البداية</label>
                <input type="datetime-local" className="input-field text-left" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">تاريخ الانتهاء</label>
                <input type="datetime-local" className="input-field text-left" dir="ltr" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">تعليمات الاختبار</label>
                <textarea className="input-field" rows={3} placeholder="أدخل تعليمات الاختبار للطلاب..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 btn-primary py-3">إنشاء الاختبار</button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
