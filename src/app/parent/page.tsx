"use client";

import DashboardLayout from "@/components/shared/DashboardLayout";
import { StatCard, Card, Badge } from "@/components/ui/index";
import { Award, Clock, Bell, TrendingUp, ArrowUpRight, CheckCircle } from "lucide-react";

const childGrades = [
  { subject: "الرياضيات", grade: 88, max: 100, teacher: "أ. محمد العتيبي" },
  { subject: "اللغة العربية", grade: 92, max: 100, teacher: "أ. خالد السهلي" },
  { subject: "العلوم", grade: 78, max: 100, teacher: "أ. سعد الغامدي" },
  { subject: "اللغة الإنجليزية", grade: 72, max: 100, teacher: "أ. فهد المالكي" },
];

const recentAnnouncements = [
  { title: "اجتماع أولياء الأمور", date: "الثلاثاء 18 فبراير", important: true },
  { title: "اختبار منتصف الفصل — الرياضيات", date: "الأحد 15 فبراير", important: false },
  { title: "رحلة ميدانية للصف الأول", date: "الخميس 20 فبراير", important: false },
];

export default function ParentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <div className="page-header">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #f5c518, #a07808)" }} />
            <h1 className="page-title !mb-0">لوحة ولي الأمر</h1>
          </div>
          <p className="page-subtitle mr-4">متابعة أداء ابنك الدراسي</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="المتوسط العام" value="82.5%" subtitle="هذا الفصل" icon={<Award size={20} />} color="gold" />
          <StatCard title="نسبة الحضور" value="97%" subtitle="هذا الشهر" icon={<Clock size={20} />} color="green" />
          <StatCard title="الواجبات المسلمة" value="18/20" subtitle="نسبة الإنجاز" icon={<TrendingUp size={20} />} color="gold" />
          <StatCard title="إعلانات جديدة" value="3" subtitle="لم تقرأ بعد" icon={<Bell size={20} />} color="white" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="درجات ابنك" subtitle="آخر تحديث للدرجات">
            <div className="space-y-3">
              {childGrades.map((g, i) => (
                <div key={i} className="p-4 rounded-xl" style={{ background: "hsl(var(--muted))" }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>{g.subject}</span>
                    <span className="font-black text-sm" style={{ color: g.grade >= 85 ? "#c9970c" : g.grade >= 70 ? "#ca8a04" : "#dc2626" }}>
                      {g.grade}/{g.max}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${g.grade}%`,
                        background: g.grade >= 85 ? "linear-gradient(90deg, #c9970c, #f5c518)" : g.grade >= 70 ? "#ca8a04" : "#dc2626"
                      }} />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>{g.teacher}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="آخر الإعلانات" subtitle="إعلانات المدرسة">
            <div className="space-y-3">
              {recentAnnouncements.map((ann, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted))"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: "rgba(184,134,11,0.08)" }}>
                    📢
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{ann.title}</p>
                      {ann.important && <Badge variant="gold">مهم</Badge>}
                    </div>
                    <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{ann.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
