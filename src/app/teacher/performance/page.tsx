"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
const GOLD = "#c9970c";
export default function TeacherPerformance() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (user?.id) loadAssignments(); }, [user]);
  useEffect(() => { if (selectedClass) loadGrades(); }, [selectedClass]);
  async function loadAssignments() {
    const { data } = await supabase.from("teacher_class_subjects").select("*, classes(*), subjects(*)").eq("teacher_id", user!.id);
    setAssignments(data || []);
    setLoading(false);
  }
  async function loadGrades() {
    const { data: students } = await supabase.from("student_profiles").select("national_id").eq("class_id", selectedClass);
    const ids = (students||[]).map((s:any)=>s.national_id);
    if (!ids.length) { setGrades([]); return; }
    const { data } = await supabase.from("grades").select("*, subjects(name), student_profiles!student_national_id(full_name)").in("student_national_id", ids);
    setGrades(data || []);
  }
  const myClasses = [...new Map(assignments.map(a=>[a.class_id, a.classes])).values()];
  // Student averages
  const studentAvgs = () => {
    const map: Record<string,any> = {};
    grades.forEach(g => {
      const id = g.student_national_id;
      if (!map[id]) map[id] = { name: g.student_profiles?.full_name || id, vals: [] };
      map[id].vals.push((g.marks_obtained/g.max_marks)*100);
    });
    return Object.values(map).map((v:any) => ({ name: v.name.split(" ").slice(0,2).join(" "), avg: Math.round(v.vals.reduce((a:number,b:number)=>a+b,0)/v.vals.length) })).sort((a:any,b:any)=>b.avg-a.avg);
  };
  // Subject averages
  const subAvgs = () => {
    const map: Record<string,any> = {};
    grades.forEach(g => {
      const n = g.subjects?.name || "غير محدد";
      if (!map[n]) map[n] = { subject: n, total: 0, count: 0 };
      map[n].total += (g.marks_obtained/g.max_marks)*100; map[n].count++;
    });
    return Object.values(map).map((v:any)=>({ subject: v.subject, avg: Math.round(v.total/v.count) }));
  };
  const avgs = studentAvgs(); const sAvgs = subAvgs();
  const overall = avgs.length ? Math.round(avgs.reduce((a:any,b:any)=>a+b.avg,0)/avgs.length) : 0;
  const dist = [
    {name:"ممتاز",count:avgs.filter((s:any)=>s.avg>=90).length,color:"#16a34a"},
    {name:"جيد جداً",count:avgs.filter((s:any)=>s.avg>=80&&s.avg<90).length,color:"#c9970c"},
    {name:"جيد",count:avgs.filter((s:any)=>s.avg>=70&&s.avg<80).length,color:"#3b82f6"},
    {name:"مقبول",count:avgs.filter((s:any)=>s.avg>=60&&s.avg<70).length,color:"#f59e0b"},
    {name:"ضعيف",count:avgs.filter((s:any)=>s.avg<60).length,color:"#ef4444"},
  ];
  const Tip = ({active,payload,label}:any) => active&&payload?.length?<div className="rounded-xl p-3 text-sm" style={{background:"#0a0a0a",border:"1px solid rgba(184,134,11,0.3)",color:"#fff"}}><p style={{color:GOLD}}>{label}</p>{payload.map((p:any)=><p key={p.name}>{p.name}: <strong>{p.value}{typeof p.value==="number"&&p.value<=100?"%":""}</strong></p>)}</div>:null;
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:GOLD,borderTopColor:"transparent"}}/></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div><h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>أداء الطلاب</h1><p className="text-sm mt-1" style={{color:"#888"}}>تحليل بياني للأداء الأكاديمي</p></div>
        <div className="flex gap-3">
          <select className="input-field text-sm" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} style={{width:"auto"}}>
            <option value="">اختر الفصل</option>{myClasses.map((c:any)=><option key={c?.id} value={c?.id}>{c?.name}</option>)}
          </select>
        </div>
        {selectedClass && grades.length===0 && <div className="text-center py-16 rounded-2xl" style={{background:"#fff",border:"1px solid #e8e8e8"}}><div className="text-4xl mb-3">📊</div><p style={{color:"#888"}}>لا توجد درجات مدخلة لهذا الفصل بعد</p></div>}
        {selectedClass && grades.length>0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{label:"المتوسط العام",value:overall+"%",color:GOLD},{label:"عدد الطلاب",value:avgs.length,color:"#16a34a"},{label:"الأعلى",value:(avgs[0]?.avg||0)+"%",color:"#3b82f6"},{label:"يحتاج دعم",value:avgs.filter((s:any)=>s.avg<60).length,color:"#ef4444"}].map(s=>(
                <div key={s.label} className="rounded-2xl p-5" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                  <div className="text-2xl font-black" style={{color:"#0a0a0a"}}>{s.value}</div>
                  <div className="text-xs mt-1" style={{color:"#888"}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                <h3 className="font-black mb-4" style={{color:"#0a0a0a"}}>درجات الطلاب</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={avgs.slice(0,20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="name" tick={{fill:"#888",fontSize:9}} angle={-25} textAnchor="end" height={50}/>
                    <YAxis domain={[0,100]} tick={{fill:"#888",fontSize:11}}/>
                    <Tooltip content={<Tip/>}/>
                    <Bar dataKey="avg" fill={GOLD} radius={[4,4,0,0]} name="المتوسط %"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
                <h3 className="font-black mb-4" style={{color:"#0a0a0a"}}>متوسط المواد</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={sAvgs}>
                    <PolarGrid/><PolarAngleAxis dataKey="subject" tick={{fill:"#666",fontSize:11}}/>
                    <PolarRadiusAxis domain={[0,100]} tick={{fill:"#aaa",fontSize:9}}/>
                    <Radar dataKey="avg" stroke={GOLD} fill={GOLD} fillOpacity={0.25} name="المتوسط %"/>
                    <Tooltip content={<Tip/>}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
              <h3 className="font-black mb-4" style={{color:"#0a0a0a"}}>توزيع التقديرات</h3>
              <div className="flex gap-4 flex-wrap">
                {dist.map(d=>(
                  <div key={d.name} className="flex-1 min-w-24 text-center p-4 rounded-xl" style={{background:d.color+"10",border:`1px solid ${d.color}25`}}>
                    <div className="text-2xl font-black" style={{color:d.color}}>{d.count}</div>
                    <div className="text-xs mt-1 font-semibold" style={{color:d.color}}>{d.name}</div>
                    <div className="text-xs mt-0.5" style={{color:"#aaa"}}>{avgs.length?Math.round((d.count/avgs.length)*100):0}%</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {!selectedClass && <div className="text-center py-16 rounded-2xl" style={{background:"#fff",border:"1px solid #e8e8e8"}}><div className="text-4xl mb-3">📈</div><p style={{color:"#888"}}>اختر فصلاً لعرض تحليل الأداء</p></div>}
      </div>
    </DashboardLayout>
  );
}
