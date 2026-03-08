"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { Users, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
export default function TeacherClasses() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [students, setStudents] = useState<Record<string,any[]>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.id) load(); }, [user]);
  async function load() {
    const { data } = await supabase.from("teacher_class_subjects").select("*, classes(*), subjects(*)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }
  async function loadStudents(classId: string) {
    if (students[classId]) return;
    const { data } = await supabase.from("student_profiles").select("*").eq("class_id", classId).order("full_name");
    setStudents(prev => ({ ...prev, [classId]: data || [] }));
  }
  const toggle = (id: string, classId: string) => {
    if (expanded === id) { setExpanded(null); } else { setExpanded(id); loadStudents(classId); }
  };
  // Group by class
  const byClass: Record<string, any[]> = {};
  assignments.forEach(a => {
    const k = a.class_id;
    if (!byClass[k]) byClass[k] = [];
    byClass[k].push(a);
  });
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:"#c9970c",borderTopColor:"transparent"}}/></div></DashboardLayout>;
  if (assignments.length===0) return <DashboardLayout><div className="text-center py-24" dir="rtl"><div className="text-5xl mb-4">🏫</div><h2 className="text-xl font-black mb-2">لم يتم تعيينك لأي فصل بعد</h2><p style={{color:"#888"}}>يقوم المدير بتعيين الفصول والمواد للمعلمين</p></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div><h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>فصولي الدراسية</h1><p className="text-sm mt-1" style={{color:"#888"}}>{Object.keys(byClass).length} فصل — {assignments.length} مادة</p></div>
        <div className="space-y-4">
          {Object.entries(byClass).map(([classId, asgns]) => {
            const cls = asgns[0].classes;
            const isExp = expanded === classId;
            const sts = students[classId] || [];
            return (
              <div key={classId} className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                <button className="w-full flex items-center gap-4 p-5 text-right" onClick={()=>toggle(classId,classId)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{background:"rgba(184,134,11,0.1)",color:"#c9970c"}}>{cls?.section}</div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{color:"#0a0a0a"}}>{cls?.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {asgns.map((a:any)=><span key={a.id} className="text-xs px-2 py-0.5 rounded-full" style={{background:"rgba(184,134,11,0.08)",color:"#c9970c"}}>{a.subjects?.name}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm" style={{color:"#888"}}>
                    <span className="flex items-center gap-1"><Users size={14}/> {isExp&&sts.length>0 ? sts.length : "..."}</span>
                    {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </div>
                </button>
                {isExp && (
                  <div className="px-5 pb-5 border-t" style={{borderColor:"#f0f0f0"}}>
                    <div className="pt-4">
                      <p className="text-xs font-black mb-3" style={{color:"#888"}}>طلاب الفصل ({sts.length})</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sts.map((s:any,i:number)=>(
                          <div key={s.national_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{background:"#fafafa",border:"1px solid #f0f0f0"}}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{background:"rgba(184,134,11,0.1)",color:"#c9970c"}}>{i+1}</div>
                            <div className="flex-1 text-sm font-semibold truncate" style={{color:"#333"}}>{s.full_name}</div>
                            <div className="text-xs" style={{color:"#aaa",fontFamily:"monospace"}}>{s.national_id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
