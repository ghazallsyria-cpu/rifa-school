"use client";
import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Badge, Modal } from "@/components/ui/index";
import { Plus, Pin, Trash2, Edit, Bell, Users, GraduationCap, BookOpen, UserCheck } from "lucide-react";

const mockAnnouncements = [
  { id: "1", title: "الاجتماع الأسبوعي للمعلمين", content: "يُعقد الاجتماع الأسبوعي يوم الأحد القادم الساعة 10 صباحاً في قاعة الاجتماعات الكبرى. الحضور إلزامي لجميع المعلمين.", author: "الإدارة", targets: ["teacher"], date: "اليوم 10:30 ص", pinned: true },
  { id: "2", title: "موعد الاختبارات النهائية", content: "تبدأ الاختبارات النهائية للفصل الدراسي الثاني يوم السبت 12 أبريل 2025. على الطلاب الاستعداد الجيد.", author: "الإدارة", targets: ["student", "parent"], date: "أمس 2:00 م", pinned: true },
  { id: "3", title: "إجازة منتصف الفصل الدراسي", content: "يُعلم جميع الطلاب وأولياء الأمور أن إجازة منتصف الفصل ستكون من 20 إلى 24 مارس 2025.", author: "الإدارة", targets: ["student", "parent", "teacher"], date: "3 مارس", pinned: false },
  { id: "4", title: "برنامج تحفيز المتفوقين", content: "تُعلن إدارة المدرسة عن بدء برنامج تحفيز الطلاب المتفوقين الحاصلين على معدل 90% فما فوق.", author: "إدارة شؤون الطلاب", targets: ["student"], date: "1 مارس", pinned: false },
];

const roleLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "مديرون", icon: Shield, color: "bg-purple-100 text-purple-700" },
  teacher: { label: "معلمون", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  student: { label: "طلاب", icon: GraduationCap, color: "bg-green-100 text-green-700" },
  parent: { label: "أولياء", icon: UserCheck, color: "bg-orange-100 text-orange-700" },
};

import { Shield } from "lucide-react";

export default function AdminAnnouncements() {
  const [showCreate, setShowCreate] = useState(false);
  const [targets, setTargets] = useState<string[]>([]);

  const toggleTarget = (t: string) => setTargets(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">الإعلانات 📢</h1>
            <p className="page-subtitle">إدارة ونشر الإعلانات للمدرسة</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 btn-primary text-sm py-2.5">
            <Plus size={16} /> إعلان جديد
          </button>
        </div>

        <div className="space-y-4">
          {mockAnnouncements.map(ann => (
            <div key={ann.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-5 ${ann.pinned ? "border-amber-200 dark:border-amber-700/30" : "border-gray-100 dark:border-gray-700"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${ann.pinned ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-primary-100 dark:bg-primary-900/20 text-primary-600"}`}>
                  {ann.pinned ? <Pin size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{ann.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {ann.targets.map(t => {
                          const info = roleLabels[t];
                          if (!info) return null;
                          const Icon = info.icon;
                          return <span key={t} className={`badge text-xs gap-1 ${info.color}`}><Icon size={10} />{info.label}</span>;
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {ann.pinned && <Badge variant="warning">مثبت</Badge>}
                      <button className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-amber-500 transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">{ann.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>✍️ {ann.author}</span>
                    <span>{ann.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="إنشاء إعلان جديد" size="lg">
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowCreate(false); }}>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">عنوان الإعلان *</label>
              <input type="text" className="input-field" placeholder="عنوان الإعلان" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">المحتوى *</label>
              <textarea className="input-field resize-none" rows={4} placeholder="اكتب نص الإعلان هنا..." required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">المُرسَل إليهم *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(roleLabels).filter(([k]) => k !== "admin").map(([key, info]) => {
                  const Icon = info.icon;
                  const active = targets.includes(key);
                  return (
                    <button key={key} type="button" onClick={() => toggleTarget(key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${active ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300" : "border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300"}`}>
                      <Icon size={16} />{info.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pin" className="w-4 h-4 rounded" />
              <label htmlFor="pin" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">تثبيت الإعلان في الأعلى</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 btn-primary py-3">نشر الإعلان</button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">إلغاء</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
