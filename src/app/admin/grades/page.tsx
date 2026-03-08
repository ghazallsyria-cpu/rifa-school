"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Search, TrendingUp, Award, AlertTriangle } from "lucide-react";
const GOLD = "#c9970c";
export default function AdminGrades() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [grades, setGrades] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  async function load() {
    const { data: cls } = await supabase.from("classes").select("*").order("grade").order("section");
    setClasses(cls || []);
    const { data: gr } = await supabase.from("grades").select("*, subjects(name), student_profiles!student_national_id(full_name, grade, class_id)");
    setGrades(gr || []);
    setLoading(false);
  }
  const studentAverages = () => {
    const map: Record<string, any> = {};
    grades.forEach(g => {
      const id = g.student_national_id;
      const sp = g.student_profiles;
      if (!map[id]) map[id] = { id, name: sp?.full_name || id, grade: sp?.grade || "", class_id: sp?.class_id || "", vals: [] };
      map[id].vals.push((g.marks_obtained / g.max_marks) * 100);
    });
    return Object.values(map).map((v: any) => ({ ...v, avg: Math.round(v.vals.reduce((a:number,b:number)=>a+b,0)/v.vals.length), count: v.vals.length })).sort((a:any,b:any)=>b.avg-a.avg);
  };
  const subjectAverages = () => {
    const map: Record<string, any> = {};
    grades.forEach(g => {
      const n = g.subjects?.name || "غير محدد";
      if (!map[n]) map[n] = { name: n, total: 0, count: 0 };
      map[n].total += (g.marks_obtained/g.max_marks)*100; map[n].count++;
    });
    return Object.values(map).map((v:any)=>({ subject: v.name, avg: Math.round(v.total/v.count) }));
  };
  const avgs = studentAverages();
  const filtered = avgs.filter(s => {
    const mg = selectedGrade==="all"||s.grade===selectedGrade;
    const mc = selectedClass==="all"||s.class_id===selectedClass;
    const ms = !search||s.name.includes(search);
    return mg&&mc&&ms;
  });
  const subAvgs = subjectAverages();
  const overallAvg = filtered.length ? Math.round(filtered.reduce((a:any,b:any)=>a+b.avg,0)/filtered.length) : 0;
  const gradesList = [...new Set(classes.map(c=>c.grade))];
  const Tip = ({active,payload,label}:any) => active&&payload?.length ? <div className="rounded-xl p-3 text-sm" style={{background:"#0a0a0a",border:"1px solid rgba(184,134,11,0.3)",color:"#fff"}}><p style={{color:GOLD}}>{label}</p>{payload.map((p:any)=><p key={p.name}>{p.name}: <strong>{p.value}%</strong></p>)}</div> : null;
  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{borderColor:GOLD,borderTopColor:"transparent"}}/></div></DashboardLayout>;
  if (grades.length===0) return <DashboardLayout><div className="text-center py-24" dir="rtl"><div className="text-6xl mb-4">📊</div><h2 className="text-xl font-black mb-2">لا توجد درجات مدخلة بعد</h2><p style={{color:"#888"}}>سيظهر التحليل بعد إدخال درجات من لوحة المعلم</p></div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div><h1 className="text-2xl font-black" style={{color:"#0a0a0a"}}>تحليل الدرجات</h1><p className="text-sm mt-1" style={{color:"#888"}}>تقارير تفصيلية لأداء الطلاب</p></div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:"#aaa"}}/><input className="input-field pr-9 text-sm" placeholder="بحث عن طالب..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <select className="input-field text-sm" value={selectedGrade} onChange={e=>setSelectedGrade(e.target.value)} style={{width:"auto"}}><option value="all">جميع المراحل</option>{gradesList.map(g=><option key={g} value={g}>{g}</option>)}</select>
          <select className="input-field text-sm" value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} style={{width:"auto"}}><option value="all">جميع الفصول</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{label:"المتوسط العام",value:overallAvg+"%",color:"#c9970c"},{label:"عدد الطلاب",value:filtered.length,color:"#16a34a"},{label:"أعلى درجة",value:(filtered[0]?.avg||0)+"%",color:"#3b82f6"},{label:"يحتاج دعم",value:filtered.filter((s:any)=>s.avg<60).length,color:"#ef4444"}].map(s=>(
            <div key={s.label} className="rounded-2xl p-5" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
              <div className="text-2xl font-black" style={{color:"#0a0a0a"}}>{s.value}</div>
              <div className="text-xs mt-1" style={{color:"#888"}}>{s.label}</div>
              <div className="w-full h-1 rounded-full mt-3" style={{background:s.color+"20"}}><div className="h-full rounded-full" style={{width:"100%",background:s.color}}/></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
            <h3 className="font-black mb-4" style={{color:"#0a0a0a"}}>متوسط الدرجات بالمادة</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subAvgs} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" domain={[0,100]} tick={{fill:"#888",fontSize:11}}/><YAxis type="category" dataKey="subject" tick={{fill:"#555",fontSize:11}} width={80}/><Tooltip content={<Tip/>}/><Bar dataKey="avg" fill={GOLD} radius={[0,6,6,0]} name="المتوسط %"/></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-2xl p-6" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
            <h3 className="font-black mb-4" style={{color:"#0a0a0a"}}>أعلى الطلاب أداءً</h3>
            <div className="space-y-3">
              {filtered.slice(0,7).map((s:any,i:number)=>{
                const c = s.avg>=90?"#16a34a":s.avg>=70?"#c9970c":"#ef4444";
                return <div key={s.id} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{background:i<3?"#c9970c":"#f0f0f0",color:i<3?"#fff":"#333"}}>{i+1}</div><div className="flex-1 text-sm truncate" style={{color:"#333"}}>{s.name}</div><span className="text-sm font-black" style={{color:c}}>{s.avg}%</span></div>;
              })}
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{background:"#fff",border:"1px solid #e8e8e8"}}>
          <div className="p-5 border-b" style={{borderColor:"#f0f0f0"}}><h3 className="font-black" style={{color:"#0a0a0a"}}>جدول الدرجات ({filtered.length} طالب)</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{background:"#fafafa",borderBottom:"2px solid #e8e8e8"}}>{["#","الاسم","المرحلة","المواد","المتوسط","التقدير"].map(h=><th key={h} className="px-4 py-3 text-right text-xs font-black" style={{color:"#888"}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.slice(0,50).map((s:any,i:number)=>{
                  const gl = s.avg>=90?"ممتاز":s.avg>=80?"جيد جداً":s.avg>=70?"جيد":s.avg>=60?"مقبول":"ضعيف";
                  const gc = s.avg>=90?"#16a34a":s.avg>=80?"#c9970c":s.avg>=70?"#3b82f6":s.avg>=60?"#f59e0b":"#ef4444";
                  return <tr key={s.id} style={{borderBottom:"1px solid #f5f5f5"}}><td className="px-4 py-3 text-sm font-bold" style={{color:"#aaa"}}>{i+1}</td><td className="px-4 py-3 text-sm font-bold" style={{color:"#0a0a0a"}}>{s.name}</td><td className="px-4 py-3 text-xs" style={{color:"#888"}}>{s.grade}</td><td className="px-4 py-3 text-xs" style={{color:"#888"}}>{s.count} مادة</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full" style={{background:"#f0f0f0"}}><div className="h-full rounded-full" style={{width:s.avg+"%",background:gc}}/></div><span className="text-sm font-black" style={{color:gc}}>{s.avg}%</span></div></td><td className="px-4 py-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{background:gc+"15",color:gc}}>{gl}</span></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
