"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { supabase } from "@/hooks/useData";
import { Plus, Trash2, Edit3, ChevronDown, ChevronUp, Search, BookOpen, Check, X } from "lucide-react";

export default function AdminClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newAssign, setNewAssign] = useState({ teacher_id: "", subject_id: "" });
  const [editSubject, setEditSubject] = useState<{ id: string; name: string } | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: cls }, { data: tch }, { data: sub }, { data: asgn }] = await Promise.all([
      supabase.from("classes").select("*").order("grade").order("track").order("section"),
      supabase.from("teacher_profiles").select("id, full_name, subject").eq("is_active", true).order("full_name"),
      supabase.from("subjects").select("*").order("name"),
      supabase.from("teacher_class_subjects").select("*, teacher_profiles(full_name), subjects(name), classes(name)"),
    ]);
    setClasses(cls || []); setTeachers(tch || []); setSubjects(sub || []); setAssignments(asgn || []);
    setLoading(false);
  }

  async function addAssignment(classId: string) {
    if (!newAssign.teacher_id || !newAssign.subject_id) { setMsg("اختر المعلم والمادة"); return; }
    const { error } = await supabase.from("teacher_class_subjects").insert({ teacher_id: newAssign.teacher_id, class_id: classId, subject_id: newAssign.subject_id });
    if (error) setMsg(error.message.includes("unique") ? "هذا التعيين موجود" : error.message);
    else { setMsg(""); setAddingFor(null); setNewAssign({ teacher_id: "", subject_id: "" }); load(); }
  }

  async function removeAssignment(id: string) {
    await supabase.from("teacher_class_subjects").delete().eq("id", id);
    load();
  }

  async function addSubject() {
    if (!newSubjectName.trim()) return;
    await supabase.from("subjects").insert({ name: newSubjectName.trim() });
    setNewSubjectName(""); setShowAddSubject(false); load();
  }

  async function updateSubject() {
    if (!editSubject || !editSubject.name.trim()) return;
    await supabase.from("subjects").update({ name: editSubject.name }).eq("id", editSubject.id);
    setEditSubject(null); load();
  }

  async function deleteSubject(id: string) {
    if (!confirm("هل تريد حذف هذه المادة؟ سيتم حذف جميع التعيينات المرتبطة بها.")) return;
    await supabase.from("teacher_class_subjects").delete().eq("subject_id", id);
    await supabase.from("subjects").delete().eq("id", id);
    load();
  }

  const grades = [...new Set(classes.map(c => c.grade))];
  const filtered = classes.filter(c => {
    const mg = filterGrade === "all" || c.grade === filterGrade;
    const ms = !search || c.name.includes(search);
    return mg && ms;
  });
  const getClassAsgns = (cid: string) => assignments.filter(a => a.class_id === cid);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>الفصول والمواد</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{classes.length} فصل — {subjects.length} مادة</p>
          </div>
          <button onClick={() => setShowAddSubject(true)} className="btn btn-primary"><Plus size={16} /> إضافة مادة</button>
        </div>

        {msg && <div className="p-3 rounded-xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)" }}>{msg}</div>}

        {/* Subjects management */}
        <div className="card p-5">
          <div className="section-header">
            <div><div className="section-title">المواد الدراسية</div><div className="section-sub">اضغط على المادة لتعديل اسمها</div></div>
            <button onClick={() => setShowAddSubject(!showAddSubject)} className="btn btn-secondary btn-sm"><Plus size={14} /> مادة جديدة</button>
          </div>
          {showAddSubject && (
            <div className="flex gap-2 mb-4 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <input className="input-field flex-1 text-sm" placeholder="اسم المادة الجديدة" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSubject()} />
              <button onClick={addSubject} className="btn btn-primary btn-sm"><Check size={14} /></button>
              <button onClick={() => { setShowAddSubject(false); setNewSubjectName(""); }} className="btn btn-secondary btn-sm"><X size={14} /></button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <div key={s.id} className="flex items-center gap-1 rounded-xl" style={{ background: "rgba(201,151,12,0.06)", border: "1px solid rgba(201,151,12,0.15)" }}>
                {editSubject?.id === s.id ? (
                  <>
                    <input className="px-2 py-1 text-xs font-bold bg-transparent outline-none" style={{ color: "#c9970c", width: "100px" }} value={editSubject.name} onChange={e => setEditSubject({ ...editSubject, name: e.target.value })} autoFocus onKeyDown={e => e.key === "Enter" && updateSubject()} />
                    <button onClick={updateSubject} className="p-1 rounded" style={{ color: "#10b981" }}><Check size={12} /></button>
                    <button onClick={() => setEditSubject(null)} className="p-1 rounded" style={{ color: "#ef4444" }}><X size={12} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditSubject({ id: s.id, name: s.name })} className="px-3 py-1.5 text-xs font-bold" style={{ color: "#c9970c" }}>
                      <Edit3 size={10} className="inline ml-1" />{s.name}
                    </button>
                    <button onClick={() => deleteSubject(s.id)} className="pr-2 py-1" style={{ color: "#d1d5db" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ef4444"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#d1d5db"}>
                      <Trash2 size={11} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {subjects.length === 0 && <p className="text-sm" style={{ color: "var(--text-3)" }}>لا توجد مواد — أضف مادة أولاً</p>}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
            <input className="input-field pr-9 text-sm" placeholder="بحث عن فصل..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field text-sm" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ width: "auto" }}>
            <option value="all">جميع المراحل</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Classes */}
        <div className="space-y-3">
          {filtered.map(cls => {
            const asgns = getClassAsgns(cls.id);
            const isExp = expanded === cls.id;
            return (
              <div key={cls.id} className="card overflow-hidden">
                <button className="w-full flex items-center gap-4 p-5 text-right" onClick={() => setExpanded(isExp ? null : cls.id)}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: "rgba(201,151,12,0.1)", color: "#c9970c" }}>{cls.section}</div>
                  <div className="flex-1">
                    <div className="font-black text-sm" style={{ color: "var(--text-1)" }}>{cls.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{asgns.length} مادة مُعيَّنة</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-gold">{cls.grade} — {cls.track}</span>
                    {isExp ? <ChevronUp size={16} style={{ color: "var(--text-3)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-3)" }} />}
                  </div>
                </button>

                {isExp && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                    <div className="pt-4 space-y-2">
                      {asgns.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid hsl(var(--border))" }}>
                          <BookOpen size={14} style={{ color: "#c9970c" }} />
                          <div className="flex-1">
                            <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{a.subjects?.name}</span>
                            <span className="text-xs mr-2" style={{ color: "var(--text-3)" }}>← {a.teacher_profiles?.full_name}</span>
                          </div>
                          <button onClick={() => removeAssignment(a.id)} className="btn btn-ghost btn-sm p-1.5 rounded-lg" style={{ color: "#ef4444" }}><Trash2 size={13} /></button>
                        </div>
                      ))}

                      {addingFor === cls.id ? (
                        <div className="p-4 rounded-xl mt-1" style={{ background: "rgba(201,151,12,0.04)", border: "1px dashed rgba(201,151,12,0.3)" }}>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <label className="text-xs font-bold mb-1 block" style={{ color: "var(--text-3)" }}>المعلم</label>
                              <select className="input-field text-sm" value={newAssign.teacher_id} onChange={e => setNewAssign({ ...newAssign, teacher_id: e.target.value })}>
                                <option value="">اختر المعلم</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold mb-1 block" style={{ color: "var(--text-3)" }}>المادة</label>
                              <select className="input-field text-sm" value={newAssign.subject_id} onChange={e => setNewAssign({ ...newAssign, subject_id: e.target.value })}>
                                <option value="">اختر المادة</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => addAssignment(cls.id)} className="btn btn-primary btn-sm">تعيين</button>
                            <button onClick={() => { setAddingFor(null); setMsg(""); }} className="btn btn-secondary btn-sm">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingFor(cls.id)} className="flex items-center gap-2 text-sm font-bold mt-1 px-3 py-2.5 rounded-xl w-full transition-all" style={{ background: "rgba(201,151,12,0.04)", color: "#c9970c", border: "1px dashed rgba(201,151,12,0.25)" }}>
                          <Plus size={15} /> تعيين معلم ومادة لهذا الفصل
                        </button>
                      )}
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
