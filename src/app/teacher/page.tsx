"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, BookOpen, Award, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
const GOLD = "#c9970c";
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [gradesCount, setGradesCount] = useState(0);
  const [classAvgs, setClassAvgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.id) load(); }, [user]);
  async function load() {
    const { data: asgns } = await supabase.from("teacher_class_subjects").select("*, classes(*), subjects(*)").eq("teacher_id", user!.id);
    setAssignments(asgns || []);
    // Unique classes
    const classIds = [...new Set((asgns || []).map((a: any) => a.class_id))];
    if (classIds.length > 0) {
      const { count } = await supabase.from("student_profiles").select("*", { count: "exact", head: true }).in("class_id", classIds);
      setStudentsCount(count || 0);
      // Grades count by teacher
      const { count: gc } = await supabase.from("grades").select("*", { count: "exact", head: true }).eq("teacher_id", user!.id);
      setGradesCount(gc || 0);
      // Avg per class
      const avgs = [];
      for (const cid of classIds) {
        const cls = (asgns || []).find((a: any) => a.class_id === cid)?.classes;
        const { data: sts } = await supabase.from("student_profiles").select("national_id").eq("class_id", cid);
        const ids = (sts || []).map((s: any) => s.national_id);
        if (ids.length) {
          const { data: gr } = await supabase.from("grades").select("marks_obtained, max_marks").in("student_national_id", ids).eq("teacher_id", user!.id);
          if (gr && gr.length) {
            const avg = Math.round(gr.reduce((a: number, g: any) => a + (g.marks_obtained / g.max_marks) * 100, 0) / gr.length);
            avgs.push({ class: cls?.name || cid, avg });
          }
        }
      }
      setClassAvgs(avgs);
    }
    setLoading(false);
  }
  const myClasses = [...new Map(assignments.map(a => [a.class_id, a.classes])).values()];
  const Tip = ({ active, payload, label }: any) => active && payload?.length ? <div className="rounded-xl p-3 text-sm" style={{ background: "#0a0a0a", border: "1px solid rgba(184,134,11,0.3)", color: "#fff" }}><p style={{ color: GOLD }}>{label}</p>{payload.map((p: any) => <p key={p.name}>{p.name}: <strong>{p.value}%</strong></p>)}</div> : null;
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} /></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#0a0a0a" }}>أهلاً، {user?.full_name?.split(" ")[0]}</h1>
          <p className="text-sm mt-1" style={{ color: "#888" }}>لوحة المعلم — العام الدراسي 2025/2026</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "فصولي", value: myClasses.length, icon: BookOpen, color: GOLD },
            { label: "طلابي", value: studentsCount, icon: Users, color: "#16a34a" },
            { label: "درجات مرصودة", value: gradesCount, icon: Award, color: "#3b82f6" },
            { label: "المواد", value: [...new Set(assignments.map((a: any) => a.subject_id))].length, icon: Clock, color: "#8b5cf6" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color + "15" }}><Icon size={18} style={{ color: s.color }} /></div>
                <div className="text-3xl font-black" style={{ color: "#0a0a0a" }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#888" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
        {/* My classes */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black" style={{ color: "#0a0a0a" }}>فصولي الدراسية</h3>
            <Link href="/teacher/classes" className="text-xs font-bold flex items-center gap-1" style={{ color: GOLD }}>عرض الكل <ChevronLeft size={14} /></Link>
          </div>
          {myClasses.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#aaa" }}>لم يتم تعيينك لأي فصل بعد</p>
          ) : (
            <div className="space-y-3">
              {myClasses.map((cls: any) => {
                const clsAssigns = assignments.filter(a => a.class_id === cls?.id);
                return (
                  <div key={cls?.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#fafafa", border: "1px solid #f0f0f0" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black" style={{ background: "rgba(184,134,11,0.1)", color: GOLD }}>{cls?.section}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: "#0a0a0a" }}>{cls?.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {clsAssigns.map((a: any) => <span key={a.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(184,134,11,0.08)", color: GOLD }}>{a.subjects?.name}</span>)}
                      </div>
                    </div>
                    <Link href="/teacher/grades" className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(184,134,11,0.1)", color: GOLD }}>رصد الدرجات</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Chart */}
        {classAvgs.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #e8e8e8" }}>
            <h3 className="font-black mb-4" style={{ color: "#0a0a0a" }}>متوسط الدرجات بالفصل</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={classAvgs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="class" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="avg" fill={GOLD} radius={[6, 6, 0, 0]} name="المتوسط %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
