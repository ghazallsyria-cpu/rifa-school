"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { Plus, Save, Search } from "lucide-react";
const TERMS = ["الفصل الأول","الفصل الثاني","الفصل الثالث"];
const TYPES = ["اختبار تحريري","اختبار شفهي","واجب","نشاط","مشروع","اختبار نهائي"];
export default function TeacherGrades() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [existingGrades, setExistingGrades] = useState<any[]>([]);
  const [term, setTerm] = useState(TERMS[0]);
  const [examType, setExamType] = useState(TYPES[0]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksMap, setMarksMap] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.id) loadAssignments(); }, [user]);
  useEffect(() => { if (selectedClass && selectedSubject) { loadStudents(); loadGrades(); } }, [selectedClass,selectedSubject,term,examType]);
  async function loadAssignments() {
    const { data } = await supabase.from("teacher_class_subjects").select("*, classes(*), subjects(*)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }
  async function loadStudents() {
    const { data } = await supabase.from("student_profiles").select("*").eq("class_id", selectedClass).order("full_name");
    setStudents(data || []);
    const init: Record<string,string> = {};
    (data||[]).forEach((s:any) => init[s.national_id] = "");
    setMarksMap(init);
  }
  async function loadGrades() {
    const ids = students.map(s=>s.national_id);
    if (!ids.length) return;
    const { data } = await supabase.from("grades").select("*, subjects(name)").in("student_national_id", ids).eq("subject_id", selectedSubject).eq("term", term).eq("exam_type", examType);
    setExistingGrades(data || []);
    const m: Record<string,string> = {};
    (data||[]).forEach((g:any) => m[g.student_national_id] = String(g.marks_obtained));
    setMarksMap(prev => ({ ...prev, ...m }));
  }
  async function saveGrades() {
    setSaving(true); setMsg("");
    let saved = 0, errors = 0;
    for (const [sid, mark] of Object.entries(marksMap)) {
      if (mark === "" || mark === null) continue;
      const val = parseFloat(mark);
      if (isNaN(val) || val < 0 || val > maxMarks) continue;
      const existing = existingGrades.find(g=>g.student_national_id===sid);
      if (existing) {
        const { error } = await supabase.from("grades").update({ marks_obtained: val, max_marks: maxMarks, updated_at: new Date().toISOString() }).eq("id", existing.id);
        if (!error) saved++; else errors++;
      } else {
        const { error } = await supabase.from("grades").insert({ student_national_id: sid, subject_id: selectedSubject, marks_obtained: val, max_marks: maxMarks, term, exam_type: examType, teacher_id: user!.id });
        if (!error) saved++; else errors++;
      }
    }
    setMsg(`✅ تم حفظ ${saved} درجة${errors>0?" — "+errors+" خطأ":""}`);
    loadGrades(); setSaving(false);
  }
  // Unique classes from assignments
  const myClasses = [...new Map(assignments.map(a=>[a.class_id, a.classes])).values()];
  const mySubjects = assignments.filter(a=>a.class_id===selectedClass).map(a=>a.subjects);
  const filtered = students.filter(s => !search || s.full_name.includes(search));
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:"#c9970c",borderTopColor:"transparent"}}/></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div><h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>إدخال الدرجات</h1><p className="text-sm mt-1" style={{color:"#888"}}>رصد درجات الطلاب بالمواد والفصول</p></div>
        {/* Controls */}
        <div className="p-5 rounded-2xl" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div><label className="text-xs font-bold mb-1 block" style={{color:"#666"}}>الفصل الدراسي</label>
              <select className="input-field text-sm" value={selectedClass} onChange={e=>{setSelectedClass(e.target.value);setSelectedSubject("");}}>
                <option value="">اختر الفصل</option>{myClasses.map((c:any)=><option key={c?.id} value={c?.id}>{c?.name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold mb-1 block" style={{color:"#666"}}>المادة</label>
              <select className="input-field text-sm" value={selectedSubject} onChange={e=>setSelectedSubject(e.target.value)} disabled={!selectedClass}>
                <option value="">اختر المادة</option>{mySubjects.map((s:any)=><option key={s?.id} value={s?.id}>{s?.name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold mb-1 block" style={{color:"#666"}}>الفصل</label>
              <select className="input-field text-sm" value={term} onChange={e=>setTerm(e.target.value)}>
                {TERMS.map(t=><option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs font-bold mb-1 block" style={{color:"#666"}}>نوع التقييم</label>
              <select className="input-field text-sm" value={examType} onChange={e=>setExamType(e.target.value)}>
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs font-bold mb-1 block" style={{color:"#666"}}>الدرجة الكاملة</label>
              <input className="input-field text-sm" type="number" value={maxMarks} onChange={e=>setMaxMarks(parseInt(e.target.value)||100)} min={1} max={200}/></div>
          </div>
        </div>
        {msg && <div className="p-3 rounded-xl text-sm" style={{background:msg.startsWith("✅")?"rgba(34,197,94,0.08)":"rgba(220,38,38,0.08)",color:msg.startsWith("✅")?"#16a34a":"#dc2626",border:`1px solid ${msg.startsWith("✅")?"rgba(34,197,94,0.3)":"rgba(220,38,38,0.3)"}`}}>{msg}</div>}
        {selectedClass && selectedSubject && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:"#aaa"}}/><input className="input-field pr-9 text-sm" placeholder="بحث عن طالب..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
              <button onClick={saveGrades} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2.5">
                {saving?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save size={16}/>}
                حفظ الدرجات
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
              <table className="w-full">
                <thead><tr style={{background:"#fafafa",borderBottom:"2px solid #e8e8e8"}}>{["#","اسم الطالب","الرقم المدني",`الدرجة / ${maxMarks}`,"النسبة","التقدير"].map(h=><th key={h} className="px-4 py-3 text-right text-xs font-black" style={{color:"#888"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map((s:any,i:number)=>{
                    const val = parseFloat(marksMap[s.national_id]||"");
                    const pct = !isNaN(val) ? Math.round((val/maxMarks)*100) : null;
                    const gc = pct===null?"#aaa":pct>=90?"#16a34a":pct>=70?"#c9970c":pct>=60?"#f59e0b":"#ef4444";
                    const gl = pct===null?"—":pct>=90?"ممتاز":pct>=80?"جيد جداً":pct>=70?"جيد":pct>=60?"مقبول":"ضعيف";
                    return (
                      <tr key={s.national_id} style={{borderBottom:"1px solid #f5f5f5"}}>
                        <td className="px-4 py-2.5 text-sm" style={{color:"#aaa"}}>{i+1}</td>
                        <td className="px-4 py-2.5 text-sm font-bold" style={{color:"#0a0a0a"}}>{s.full_name}</td>
                        <td className="px-4 py-2.5 text-xs" style={{color:"#aaa",fontFamily:"monospace"}}>{s.national_id}</td>
                        <td className="px-4 py-2.5">
                          <input type="number" min={0} max={maxMarks} value={marksMap[s.national_id]||""} onChange={e=>setMarksMap(prev=>({...prev,[s.national_id]:e.target.value}))}
                            className="rounded-lg border px-3 py-1.5 text-sm font-bold text-center w-20" style={{border:"1px solid #e8e8e8",outline:"none",color:"#0a0a0a"}}
                            placeholder="—"/>
                        </td>
                        <td className="px-4 py-2.5 text-sm font-black" style={{color:gc}}>{pct!==null?pct+"%":"—"}</td>
                        <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{background:gc+"15",color:gc}}>{gl}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {(!selectedClass||!selectedSubject) && (
          <div className="text-center py-16 rounded-2xl" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
            <div className="text-4xl mb-3">📝</div>
            <p className="font-bold" style={{color:"#333"}}>اختر الفصل والمادة لإدخال الدرجات</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
