"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/hooks/useData";
import { Search, ChevronDown, Users, Award } from "lucide-react";
export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string|null>(null);
  useEffect(() => { load(); }, []);
  async function load() {
    const [{ data: sts }, { data: cls }, { data: gr }] = await Promise.all([
      supabase.from("student_profiles").select("*").order("grade").order("full_name"),
      supabase.from("classes").select("*").order("grade").order("section"),
      supabase.from("grades").select("*, subjects(name)"),
    ]);
    setStudents(sts || []);
    setClasses(cls || []);
    setGrades(gr || []);
    setLoading(false);
  }
  const getStudentGrades = (id: string) => grades.filter(g=>g.student_national_id===id);
  const getStudentAvg = (id: string) => {
    const g = getStudentGrades(id);
    if (!g.length) return null;
    return Math.round(g.reduce((a,g)=>a+(g.marks_obtained/g.max_marks)*100,0)/g.length);
  };
  const getClassName = (classId: string) => classes.find(c=>c.id===classId)?.name || "—";
  const gradesList = [...new Set(students.map(s=>s.grade))];
  const filtered = students.filter(s => {
    const mg = selectedGrade==="all"||s.grade===selectedGrade;
    const mc = selectedClass==="all"||s.class_id===selectedClass;
    const ms = !search||s.full_name.includes(search)||s.national_id.includes(search);
    return mg&&mc&&ms;
  });
  const gc = (pct:number) => pct>=90?"#16a34a":pct>=80?"#c9970c":pct>=70?"#3b82f6":pct>=60?"#f59e0b":"#ef4444";
  const gl = (pct:number) => pct>=90?"ممتاز":pct>=80?"جيد جداً":pct>=70?"جيد":pct>=60?"مقبول":"ضعيف";
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:"#c9970c",borderTopColor:"transparent"}}/></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>الطلاب</h1>
          <p className="text-sm mt-1" style={{color:"#888"}}>{filtered.length} طالب من أصل {students.length}</p>
        </div>
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:"#aaa"}}/><input className="input-field pr-9 text-sm" placeholder="بحث بالاسم أو الرقم المدني..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="input-field text-sm" value={selectedGrade} onChange={e=>{setSelectedGrade(e.target.value);setSelectedClass("all");}} style={{width:"auto"}}><option value="all">جميع المراحل</option>{gradesList.map(g=><option key={g} value={g}>{g}</option>)}</select>
          <select className="input-field text-sm" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} style={{width:"auto"}}><option value="all">جميع الفصول</option>{classes.filter(c=>selectedGrade==="all"||c.grade===selectedGrade).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        {/* Students table */}
        <div className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
          <table className="w-full">
            <thead><tr style={{background:"#fafafa",borderBottom:"2px solid #e8e8e8"}}>{["#","الاسم","الرقم المدني","الفصل","المرحلة","المعدل","التقدير",""].map(h=><th key={h} className="px-4 py-3 text-right text-xs font-black" style={{color:"#888"}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((s,i)=>{
                const avg = getStudentAvg(s.national_id);
                const isExp = expandedStudent===s.national_id;
                const sGrades = getStudentGrades(s.national_id);
                return <>
                  <tr key={s.national_id} style={{borderBottom:"1px solid #f5f5f5",background:isExp?"rgba(184,134,11,0.02)":"transparent"}}>
                    <td className="px-4 py-3 text-sm" style={{color:"#aaa"}}>{i+1}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{color:"#0a0a0a"}}>{s.full_name}</td>
                    <td className="px-4 py-3 text-xs" style={{color:"#aaa",fontFamily:"monospace"}}>{s.national_id}</td>
                    <td className="px-4 py-3 text-xs" style={{color:"#555"}}>{getClassName(s.class_id)}</td>
                    <td className="px-4 py-3 text-xs" style={{color:"#555"}}>{s.grade} {s.track!=="عام"?`- ${s.track}`:""}</td>
                    <td className="px-4 py-3"><span className="text-sm font-black" style={{color:avg!==null?gc(avg):"#aaa"}}>{avg!==null?avg+"%":"—"}</span></td>
                    <td className="px-4 py-3">{avg!==null?<span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:gc(avg)+"15",color:gc(avg)}}>{gl(avg)}</span>:<span style={{color:"#aaa",fontSize:"12px"}}>—</span>}</td>
                    <td className="px-4 py-3">
                      {sGrades.length>0&&<button onClick={()=>setExpandedStudent(isExp?null:s.national_id)} className="flex items-center gap-1 text-xs font-bold" style={{color:"#c9970c"}}>
                        <Award size={13}/> {sGrades.length} درجة <ChevronDown size={13} style={{transform:isExp?"rotate(180deg)":"none",transition:"transform 0.2s"}}/>
                      </button>}
                    </td>
                  </tr>
                  {isExp&&(
                    <tr key={s.national_id+"_exp"} style={{borderBottom:"1px solid #f5f5f5"}}>
                      <td colSpan={8} className="px-6 py-4" style={{background:"rgba(184,134,11,0.03)"}}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {sGrades.map(g=>{
                            const pct=Math.round((g.marks_obtained/g.max_marks)*100);
                            return <div key={g.id} className="p-3 rounded-xl" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                              <div className="text-xs font-black mb-1" style={{color:"#333"}}>{g.subjects?.name}</div>
                              <div className="text-lg font-black" style={{color:gc(pct)}}>{g.marks_obtained}<span className="text-xs font-normal" style={{color:"#aaa"}}>/{g.max_marks}</span></div>
                              <div className="text-xs mt-0.5" style={{color:"#aaa"}}>{g.exam_type} — {g.term}</div>
                            </div>;
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </>;
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div className="text-center py-16"><p style={{color:"#aaa"}}>لا يوجد طلاب يطابقون البحث</p></div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
