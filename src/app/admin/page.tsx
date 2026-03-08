"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { GraduationCap, Users, Home, Award, TrendingUp, BookOpen } from "lucide-react";

const GOLD = "#c9970c"; const COLORS = ["#c9970c","#f5c518","#a07808","#7a5a05","#dc2626"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });
  const [gradeByClass, setGradeByClass] = useState<any[]>([]);
  const [gradesDist, setGradesDist] = useState<any[]>([]);
  const [attendanceWeek, setAttendanceWeek] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ count: sc }, { count: tc }, { count: cc }, { count: subC }] = await Promise.all([
      supabase.from("student_profiles").select("*", { count: "exact", head: true }),
      supabase.from("teacher_profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("classes").select("*", { count: "exact", head: true }),
      supabase.from("subjects").select("*", { count: "exact", head: true }),
    ]);
    setStats({ students: sc || 0, teachers: tc || 0, classes: cc || 0, subjects: subC || 0 });

    // Grades by grade level
    const { data: gradesRaw } = await supabase
      .from("grades").select("marks_obtained, max_marks, student_profiles!student_national_id(grade)");
    if (gradesRaw && gradesRaw.length > 0) {
      const byGrade: Record<string, { total: number; count: number }> = {};
      gradesRaw.forEach((g: any) => {
        const gr = g.student_profiles?.grade || "غير محدد";
        if (!byGrade[gr]) byGrade[gr] = { total: 0, count: 0 };
        byGrade[gr].total += (g.marks_obtained / g.max_marks) * 100;
        byGrade[gr].count++;
      });
      setGradeByClass(Object.entries(byGrade).map(([grade, v]) => ({ grade, avg: Math.round(v.total / v.count) })));

      // Distribution
      const dist = [
        { name: "ممتاز (90+)", value: 0, color: COLORS[0] },
        { name: "جيد جداً (80-89)", value: 0, color: COLORS[1] },
        { name: "جيد (70-79)", value: 0, color: COLORS[2] },
        { name: "مقبول (60-69)", value: 0, color: COLORS[3] },
        { name: "ضعيف (<60)", value: 0, color: COLORS[4] },
      ];
      gradesRaw.forEach((g: any) => {
        const pct = (g.marks_obtained / g.max_marks) * 100;
        if (pct >= 90) dist[0].value++;
        else if (pct >= 80) dist[1].value++;
        else if (pct >= 70) dist[2].value++;
        else if (pct >= 60) dist[3].value++;
        else dist[4].value++;
      });
      setGradesDist(dist.filter(d => d.value > 0));
    } else {
      // Demo data if no grades yet
      setGradeByClass([
        { grade: "العاشر", avg: 76 }, { grade: "الحادي عشر", avg: 79 }, { grade: "الثاني عشر", avg: 82 }
      ]);
      setGradesDist([
        { name: "ممتاز", value: 25, color: COLORS[0] },
        { name: "جيد جداً", value: 35, color: COLORS[1] },
        { name: "جيد", value: 25, color: COLORS[2] },
        { name: "مقبول", value: 10, color: COLORS[3] },
        { name: "ضعيف", value: 5, color: COLORS[4] },
      ]);
    }

    // Attendance this week (demo)
    const days = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"];
    const { data: attData } = await supabase.from("attendance").select("date, status");
    if (attData && attData.length > 0) {
      const byDay: Record<string, { present: number; absent: number }> = {};
      attData.forEach((a: any) => {
        const day = new Date(a.date).toLocaleDateString("ar-SA", { weekday: "long" });
        if (!byDay[day]) byDay[day] = { present: 0, absent: 0 };
        if (a.status === "حاضر" || a.status === "متأخر") byDay[day].present++;
        else byDay[day].absent++;
      });
      setAttendanceWeek(Object.entries(byDay).slice(0,5).map(([day, v]) => ({ day, ...v })));
    } else {
      setAttendanceWeek(days.map(d => ({ day: d, present: Math.floor(Math.random()*50+sc!/2||200), absent: Math.floor(Math.random()*20+5) })));
    }
    setLoading(false);
  }

  const Tip = ({ active, payload, label }: any) => active && payload?.length ? (
    <div className="rounded-xl p-3 shadow-xl text-sm" style={{ background: "#0a0a0a", border: "1px solid rgba(184,134,11,0.3)", color: "#fff" }}>
      <p className="font-bold mb-1" style={{ color: GOLD }}>{label}</p>
      {payload.map((p: any) => <p key={p.name}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  ) : null;

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#c9970c", borderTopColor: "transparent" }} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#0a0a0a" }}>لوحة التحكم</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>نظرة عامة على المدرسة — 2025/2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الطلاب", value: stats.students, icon: GraduationCap, color: "#c9970c" },
            { label: "معلمون نشطون", value: stats.teachers, icon: Users, color: "#16a34a" },
            { label: "الفصول الدراسية", value: stats.classes, icon: Home, color: "#3b82f6" },
            { label: "المواد الدراسية", value: stats.subjects, icon: BookOpen, color: "#8b5cf6" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + "15" }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
                <div className="text-3xl font-black" style={{ color: "#0a0a0a" }}>{s.value.toLocaleString("ar")}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: "#888" }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
            <h3 className="font-black mb-1" style={{ color: "#0a0a0a" }}>متوسط الدرجات بالمرحلة</h3>
            <p className="text-xs mb-4" style={{ color: "#aaa" }}>نسبة مئوية</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeByClass}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="grade" tick={{ fill: "#888", fontSize: 12 }} />
                <YAxis domain={[0,100]} tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="avg" fill={GOLD} radius={[6,6,0,0]} name="المتوسط %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
            <h3 className="font-black mb-1" style={{ color: "#0a0a0a" }}>توزيع الدرجات</h3>
            <p className="text-xs mb-4" style={{ color: "#aaa" }}>تصنيف الطلاب</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gradesDist} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {gradesDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
          <h3 className="font-black mb-1" style={{ color: "#0a0a0a" }}>الحضور الأسبوعي</h3>
          <p className="text-xs mb-4" style={{ color: "#aaa" }}>حاضر vs غائب</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fill: "#888", fontSize: 12 }} />
              <YAxis tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="present" stroke="#c9970c" fill="rgba(184,134,11,0.1)" strokeWidth={2} name="حاضر" />
              <Area type="monotone" dataKey="absent" stroke="#dc2626" fill="rgba(220,38,38,0.07)" strokeWidth={2} name="غائب" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
