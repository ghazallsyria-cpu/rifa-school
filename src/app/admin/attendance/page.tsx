"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/hooks/useData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis
} from "recharts";
import { Users, TrendingUp, TrendingDown, Calendar, Filter, Download } from "lucide-react";

const GOLD = "#c9970c";
const COLORS = { حاضر: "#10b981", غائب: "#ef4444", متأخر: "#f59e0b", مستأذن: "#3b82f6" };
const PERIODS = [
  { label: "يومي", value: "daily" },
  { label: "شهري", value: "monthly" },
  { label: "فصلي", value: "term" },
];

const ChartTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="chart-tooltip">
      <p className="text-xs font-black mb-2" style={{ color: GOLD }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  ) : null;

export default function AdminAttendance() {
  const [classes, setClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [period, setPeriod] = useState("monthly");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "class" | "student">("overview");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: cls }, { data: att }, { data: sts }] = await Promise.all([
      supabase.from("classes").select("*").order("grade").order("section"),
      supabase.from("attendance").select("*, student_profiles!student_national_id(full_name, grade, class_id, section)").order("date"),
      supabase.from("student_profiles").select("*").order("full_name"),
    ]);
    setClasses(cls || []);
    setAttendance(att || []);
    setStudents(sts || []);
    setLoading(false);
  }

  // Filter attendance
  const filteredAtt = attendance.filter(a => {
    const mc = selectedClass === "all" || a.student_profiles?.class_id === selectedClass;
    const mg = selectedGrade === "all" || a.student_profiles?.grade === selectedGrade;
    return mc && mg;
  });

  // Overall stats
  const total = filteredAtt.length;
  const present = filteredAtt.filter(a => a.status === "حاضر").length;
  const absent = filteredAtt.filter(a => a.status === "غائب").length;
  const late = filteredAtt.filter(a => a.status === "متأخر").length;
  const excused = filteredAtt.filter(a => a.status === "مستأذن").length;
  const presentPct = total ? Math.round(((present + late) / total) * 100) : 0;

  // Daily chart data (last 14 days)
  const dailyData = () => {
    const map: Record<string, any> = {};
    filteredAtt.forEach(a => {
      const d = a.date?.slice(0, 10) || "";
      if (!map[d]) map[d] = { date: d, حاضر: 0, غائب: 0, متأخر: 0, مستأذن: 0 };
      map[d][a.status] = (map[d][a.status] || 0) + 1;
    });
    return Object.values(map).sort((a: any, b: any) => a.date.localeCompare(b.date)).slice(-14);
  };

  // Monthly chart data
  const monthlyData = () => {
    const map: Record<string, any> = {};
    filteredAtt.forEach(a => {
      const d = a.date?.slice(0, 7) || "";
      if (!map[d]) map[d] = { month: d, حاضر: 0, غائب: 0, متأخر: 0, مستأذن: 0, total: 0 };
      map[d][a.status] = (map[d][a.status] || 0) + 1;
      map[d].total++;
    });
    return Object.values(map).sort((a: any, b: any) => a.month.localeCompare(b.month));
  };

  // By class
  const byClass = () => {
    const map: Record<string, any> = {};
    filteredAtt.forEach(a => {
      const cid = a.student_profiles?.class_id || "—";
      const cls = classes.find(c => c.id === cid);
      const name = cls?.name || "غير محدد";
      if (!map[cid]) map[cid] = { class: name, total: 0, present: 0, absent: 0 };
      map[cid].total++;
      if (a.status === "حاضر" || a.status === "متأخر") map[cid].present++;
      else if (a.status === "غائب") map[cid].absent++;
    });
    return Object.values(map).map((v: any) => ({
      ...v, pct: v.total ? Math.round((v.present / v.total) * 100) : 0
    })).sort((a: any, b: any) => a.class.localeCompare(b.class));
  };

  // By grade
  const byGrade = () => {
    const map: Record<string, any> = {};
    filteredAtt.forEach(a => {
      const g = a.student_profiles?.grade || "غير محدد";
      if (!map[g]) map[g] = { grade: g, total: 0, present: 0 };
      map[g].total++;
      if (a.status === "حاضر" || a.status === "متأخر") map[g].present++;
    });
    return Object.values(map).map((v: any) => ({ ...v, avg: v.total ? Math.round((v.present / v.total) * 100) : 0 }));
  };

  // Students with lowest attendance
  const lowAttendance = () => {
    const map: Record<string, any> = {};
    filteredAtt.forEach(a => {
      const id = a.student_national_id;
      if (!map[id]) map[id] = { id, name: a.student_profiles?.full_name || id, total: 0, present: 0, class: a.student_profiles?.class_id || "" };
      map[id].total++;
      if (a.status === "حاضر" || a.status === "متأخر") map[id].present++;
    });
    return Object.values(map)
      .filter((v: any) => v.total >= 5)
      .map((v: any) => ({ ...v, pct: Math.round((v.present / v.total) * 100) }))
      .sort((a: any, b: any) => a.pct - b.pct).slice(0, 10);
  };

  const pieData = [
    { name: "حاضر", value: present, color: COLORS["حاضر"] },
    { name: "غائب", value: absent, color: COLORS["غائب"] },
    { name: "متأخر", value: late, color: COLORS["متأخر"] },
    { name: "مستأذن", value: excused, color: COLORS["مستأذن"] },
  ].filter(d => d.value > 0);

  const gradesList = [...new Set(classes.map(c => c.grade))];
  const chartData = period === "daily" ? dailyData() : monthlyData();
  const classData = byClass();
  const gradeData = byGrade();
  const lowStudents = lowAttendance();

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>تحليل الحضور والغياب</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>إحصاءات شاملة — {total.toLocaleString("ar")} سجل</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select className="input-field text-sm" value={selectedGrade} onChange={e => { setSelectedGrade(e.target.value); setSelectedClass("all"); }} style={{ width: "auto" }}>
              <option value="all">جميع المراحل</option>
              {gradesList.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select className="input-field text-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ width: "auto" }}>
              <option value="all">جميع الفصول</option>
              {classes.filter(c => selectedGrade === "all" || c.grade === selectedGrade).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "نسبة الحضور", value: presentPct + "%", sub: `${present + late} حاضر`, color: presentPct >= 85 ? "#10b981" : presentPct >= 70 ? "#f59e0b" : "#ef4444", icon: TrendingUp },
            { label: "إجمالي السجلات", value: total.toLocaleString("ar"), sub: "سجل حضور", color: GOLD, icon: Calendar },
            { label: "حاضر", value: present, sub: `${total ? Math.round((present / total) * 100) : 0}%`, color: "#10b981", icon: Users },
            { label: "غائب", value: absent, sub: `${total ? Math.round((absent / total) * 100) : 0}%`, color: "#ef4444", icon: TrendingDown },
            { label: "متأخر", value: late, sub: `${total ? Math.round((late / total) * 100) : 0}%`, color: "#f59e0b", icon: Calendar },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + "15" }}>
                    <Icon size={17} style={{ color: s.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.sub}</span>
                </div>
                <div className="text-2xl font-black" style={{ color: "var(--text-1)" }}>{s.value}</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: "var(--text-3)" }}>{s.label}</div>
                <div className="progress-bar mt-3">
                  <div className="progress-fill" style={{ width: (typeof s.value === "string" && s.value.includes("%") ? s.value : total ? Math.round((Number(s.value) / total) * 100) + "%" : "0%"), background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Period tabs */}
        <div className="flex items-center gap-3">
          <div className="tabs">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)} className={`tab ${period === p.value ? "active" : ""}`}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Main charts */}
        {total === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">لا توجد بيانات حضور بعد</div>
              <div className="empty-state-sub">سيظهر التحليل بعد تسجيل الحضور من صفحة المعلم</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend chart */}
              <div className="card p-6 lg:col-span-2">
                <div className="section-header">
                  <div>
                    <div className="section-title">اتجاه الحضور {period === "daily" ? "اليومي" : period === "monthly" ? "الشهري" : "الفصلي"}</div>
                    <div className="section-sub">مقارنة الحضور والغياب عبر الزمن</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey={period === "monthly" ? "month" : "date"} tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="حاضر" stroke="#10b981" fill="url(#gPresent)" strokeWidth={2} />
                    <Area type="monotone" dataKey="غائب" stroke="#ef4444" fill="url(#gAbsent)" strokeWidth={2} />
                    <Area type="monotone" dataKey="متأخر" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie */}
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <div className="section-title">توزيع الحالات</div>
                    <div className="section-sub">النسب الإجمالية</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs flex-1" style={{ color: "var(--text-2)" }}>{d.name}</span>
                      <span className="text-xs font-black" style={{ color: d.color }}>{total ? Math.round((d.value / total) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By class bar chart */}
            {classData.length > 0 && (
              <div className="card p-6">
                <div className="section-header">
                  <div>
                    <div className="section-title">نسبة الحضور بالفصل</div>
                    <div className="section-sub">مقارنة الفصول الدراسية</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={classData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="class" tick={{ fill: "var(--text-3)", fontSize: 10 }} angle={-20} textAnchor="end" height={45} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-3)", fontSize: 11 }} unit="%" />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="pct" name="نسبة الحضور %" radius={[6, 6, 0, 0]}>
                      {classData.map((e: any, i: number) => (
                        <Cell key={i} fill={e.pct >= 85 ? "#10b981" : e.pct >= 70 ? GOLD : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By grade radar */}
            {gradeData.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="section-title mb-4">نسبة الحضور بالمرحلة</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={gradeData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="grade" tick={{ fill: "var(--text-2)", fontSize: 12 }} />
                      <Radar dataKey="avg" stroke={GOLD} fill={GOLD} fillOpacity={0.2} name="نسبة الحضور %" />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Low attendance students */}
                <div className="card p-6">
                  <div className="section-header">
                    <div>
                      <div className="section-title">أقل حضوراً</div>
                      <div className="section-sub">طلاب يحتاجون متابعة</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {lowStudents.slice(0, 7).map((s: any, i: number) => {
                      const c = s.pct >= 75 ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <span className="text-xs font-black w-5 text-center" style={{ color: "var(--text-3)" }}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate" style={{ color: "var(--text-1)" }}>{s.name}</div>
                            <div className="progress-bar mt-1">
                              <div className="progress-fill" style={{ width: s.pct + "%", background: c }} />
                            </div>
                          </div>
                          <span className="text-xs font-black" style={{ color: c }}>{s.pct}%</span>
                        </div>
                      );
                    })}
                    {lowStudents.length === 0 && <p className="text-xs text-center py-4" style={{ color: "var(--text-3)" }}>جميع الطلاب بنسبة حضور جيدة ✅</p>}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
