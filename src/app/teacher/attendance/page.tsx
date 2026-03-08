"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Save, TrendingDown, Calendar } from "lucide-react";

const STATUSES = ["حاضر", "غائب", "متأخر", "مستأذن"];
const SC: Record<string, string> = { حاضر: "#10b981", غائب: "#ef4444", متأخر: "#f59e0b", مستأذن: "#3b82f6" };
const ChartTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="chart-tooltip"><p className="text-xs font-black mb-1" style={{ color: "#c9970c" }}>{label}</p>{payload.map((p: any) => <p key={p.name} className="text-xs text-white">{p.name}: <strong>{p.value}</strong></p>)}</div>
) : null;

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<any[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"register" | "stats">("register");
  const [classHistory, setClassHistory] = useState<any[]>([]);

  useEffect(() => { if (user?.id) loadAssignments(); }, [user]);
  useEffect(() => { if (selectedClass) { loadStudents(); if (tab === "stats") loadHistory(); } }, [selectedClass, date]);
  useEffect(() => { if (tab === "stats" && selectedClass) loadHistory(); }, [tab, selectedClass]);

  async function loadAssignments() {
    const { data } = await supabase.from("teacher_class_subjects").select("*, classes(*)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }

  async function loadStudents() {
    const { data: sts } = await supabase.from("student_profiles").select("*").eq("class_id", selectedClass).order("full_name");
    setStudents(sts || []);
    const init: Record<string, string> = {};
    (sts || []).forEach((s: any) => { init[s.national_id] = "حاضر"; });
    const ids = (sts || []).map((s: any) => s.national_id);
    if (ids.length) {
      const { data: att } = await supabase.from("attendance").select("*").in("student_national_id", ids).eq("date", date).eq("class_id", selectedClass);
      const nm: Record<string, string> = {};
      (att || []).forEach((a: any) => { init[a.student_national_id] = a.status; nm[a.student_national_id] = a.notes || ""; });
      setNotesMap(nm);
    }
    setStatusMap(init);
  }

  async function loadHistory() {
    const { data: sts } = await supabase.from("student_profiles").select("national_id").eq("class_id", selectedClass);
    const ids = (sts || []).map((s: any) => s.national_id);
    if (!ids.length) return;
    const { data } = await supabase.from("attendance").select("*, student_profiles!student_national_id(full_name)").in("student_national_id", ids).order("date", { ascending: false });
    setClassHistory(data || []);
  }

  async function saveAttendance() {
    setSaving(true); setMsg("");
    let saved = 0;
    for (const [sid, status] of Object.entries(statusMap)) {
      try {
        const { data: existing } = await supabase.from("attendance").select("id").eq("student_national_id", sid).eq("date", date).eq("class_id", selectedClass).single();
        if (existing) await supabase.from("attendance").update({ status, notes: notesMap[sid] || null }).eq("id", existing.id);
        else await supabase.from("attendance").insert({ student_national_id: sid, class_id: selectedClass, date, status, notes: notesMap[sid] || null, recorded_by: user!.id });
        saved++;
      } catch {}
    }
    setMsg(`✅ تم حفظ حضور ${saved} طالب`);
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: Object.values(statusMap).filter(v => v === s).length }), {} as Record<string, number>);

  // Stats from history
  const byStudent = () => {
    const map: Record<string, any> = {};
    classHistory.forEach(a => {
      const id = a.student_national_id;
      if (!map[id]) map[id] = { name: a.student_profiles?.full_name?.split(" ").slice(0, 2).join(" ") || id, total: 0, present: 0, absent: 0 };
      map[id].total++;
      if (a.status === "حاضر" || a.status === "متأخر") map[id].present++;
      else if (a.status === "غائب") map[id].absent++;
    });
    return Object.values(map).map((v: any) => ({ ...v, pct: v.total ? Math.round((v.present / v.total) * 100) : 0 })).sort((a: any, b: any) => a.pct - b.pct);
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>الحضور والغياب</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>تسجيل وتحليل حضور الطلاب</p>
        </div>

        <div className="card p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="text-xs font-black mb-1.5 block" style={{ color: "var(--text-3)" }}>الفصل</label>
            <select className="input-field text-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">اختر الفصل</option>
              {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-black mb-1.5 block" style={{ color: "var(--text-3)" }}>التاريخ</label>
            <input type="date" className="input-field text-sm" value={date} onChange={e => setDate(e.target.value)} dir="ltr" />
          </div>
          {selectedClass && (
            <div className="tabs">
              <button onClick={() => setTab("register")} className={`tab ${tab === "register" ? "active" : ""}`}>تسجيل</button>
              <button onClick={() => setTab("stats")} className={`tab ${tab === "stats" ? "active" : ""}`}>إحصاءات</button>
            </div>
          )}
        </div>

        {msg && <div className="p-3 rounded-xl text-sm font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }}>{msg}</div>}

        {selectedClass && tab === "register" && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="grid grid-cols-4 gap-2">
                {STATUSES.map(s => (
                  <div key={s} className="text-center p-2.5 rounded-xl" style={{ background: SC[s] + "10", border: `1px solid ${SC[s]}20` }}>
                    <div className="text-xl font-black" style={{ color: SC[s] }}>{counts[s] || 0}</div>
                    <div className="text-xs" style={{ color: SC[s] }}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs font-bold" style={{ color: "var(--text-3)" }}>تحديد الكل:</span>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatusMap(prev => { const m = { ...prev }; students.forEach(st => m[st.national_id] = s); return m; })}
                    className="att-btn" style={{ background: SC[s] + "15", color: SC[s], borderColor: SC[s] + "30" }}>{s}</button>
                ))}
                <button onClick={saveAttendance} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? <div className="spinner w-4 h-4 border-2" /> : <Save size={14} />} حفظ
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <table className="data-table">
                <thead><tr><th>#</th><th>الطالب</th><th>الرقم المدني</th><th>الحالة</th><th>ملاحظة</th></tr></thead>
                <tbody>
                  {students.map((s: any, i: number) => {
                    const status = statusMap[s.national_id] || "حاضر";
                    const c = SC[status];
                    return (
                      <tr key={s.national_id} style={{ background: status === "غائب" ? "rgba(239,68,68,0.02)" : "transparent" }}>
                        <td className="font-bold" style={{ color: "var(--text-3)" }}>{i + 1}</td>
                        <td className="font-bold" style={{ color: "var(--text-1)" }}>{s.full_name}</td>
                        <td style={{ fontFamily: "monospace", color: "var(--text-3)", fontSize: "11px" }}>{s.national_id}</td>
                        <td>
                          <div className="flex gap-1.5">
                            {STATUSES.map(st => (
                              <button key={st} onClick={() => setStatusMap(prev => ({ ...prev, [s.national_id]: st }))}
                                className="att-btn"
                                style={{ background: status === st ? SC[st] : SC[st] + "10", color: status === st ? "white" : SC[st], borderColor: SC[st] + "40", fontWeight: status === st ? "900" : "600" }}>
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input className="rounded-lg px-3 py-1.5 text-xs w-full" style={{ border: "1px solid hsl(var(--border))", background: "var(--surface)", outline: "none", color: "var(--text-2)" }}
                            placeholder="ملاحظة..." value={notesMap[s.national_id] || ""} onChange={e => setNotesMap(prev => ({ ...prev, [s.national_id]: e.target.value }))} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {selectedClass && tab === "stats" && (
          <div className="space-y-6">
            {classHistory.length === 0 ? (
              <div className="card"><div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">لا توجد بيانات حضور</div></div></div>
            ) : (
              <>
                <div className="card p-6">
                  <div className="section-title mb-4">أقل الطلاب حضوراً</div>
                  <div className="space-y-3">
                    {byStudent().slice(0, 10).map((s: any, i: number) => {
                      const c = s.pct >= 85 ? "#10b981" : s.pct >= 70 ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={i} className="flex items-center gap-3">
                          {s.pct < 75 && <TrendingDown size={14} style={{ color: "#ef4444" }} />}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate" style={{ color: "var(--text-1)" }}>{s.name}</div>
                            <div className="progress-bar mt-1"><div className="progress-fill" style={{ width: s.pct + "%", background: c }} /></div>
                          </div>
                          <span className="text-xs font-black w-10 text-left" style={{ color: c }}>{s.pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {!selectedClass && (
          <div className="card"><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">اختر الفصل والتاريخ</div><div className="empty-state-sub">لتسجيل الحضور أو عرض الإحصاءات</div></div></div>
        )}
      </div>
    </DashboardLayout>
  );
}
