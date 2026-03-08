"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/hooks/useData";
import { Plus, Send, X, Clock, Trash2 } from "lucide-react";

const TYPES = [
  { value: "exam", label: "اختبار", icon: "📝", color: "#8b5cf6" },
  { value: "homework", label: "واجب", icon: "📋", color: "#3b82f6" },
  { value: "announcement", label: "إعلان", icon: "📢", color: "#c9970c" },
  { value: "grade", label: "درجات", icon: "🏆", color: "#10b981" },
  { value: "general", label: "عام", icon: "💬", color: "#6b7280" },
];

export default function TeacherNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "exam", target_class_id: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { if (user?.id) load(); }, [user]);

  async function load() {
    setLoading(true);
    const [{ data: notifs }, { data: asgns }] = await Promise.all([
      supabase.from("notifications").select("*").eq("sent_by_teacher", user!.id).order("created_at", { ascending: false }),
      supabase.from("teacher_class_subjects").select("*, classes(*)").eq("teacher_id", user!.id),
    ]);
    setNotifications(notifs || []);
    const uniqCls = [...new Map((asgns || []).map(a => [a.class_id, a.classes])).values()];
    setMyClasses(uniqCls);
    setLoading(false);
  }

  async function send() {
    if (!form.title.trim() || !form.body.trim()) { setMsg("يرجى ملء العنوان والمحتوى"); return; }
    setSending(true);
    const { error } = await supabase.from("notifications").insert({
      title: form.title, body: form.body, type: form.type,
      target_role: "student",
      target_class_id: form.target_class_id || null,
      sent_by_teacher: user?.id,
    });
    if (error) setMsg("خطأ: " + error.message);
    else {
      setMsg("✅ تم إرسال الإشعار");
      setForm({ title: "", body: "", type: "exam", target_class_id: "" });
      setShowForm(false);
      load();
    }
    setSending(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function del(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const typeInfo = (type: string) => TYPES.find(t => t.value === type) || TYPES[4];
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="spinner" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--text-1)" }}>إرسال إشعارات</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>أبلغ طلابك بالاختبارات والواجبات والإعلانات</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary"><Plus size={16} /> إشعار جديد</button>
        </div>

        {msg && <div className="p-4 rounded-xl text-sm font-bold" style={{ background: msg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: msg.startsWith("✅") ? "#059669" : "#dc2626", border: `1px solid ${msg.startsWith("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>{msg}</div>}

        {showForm && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal-box p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black" style={{ color: "var(--text-1)" }}>إشعار جديد</h3>
                <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-full"><X size={16} /></button>
              </div>
              <div className="mb-4">
                <label className="text-xs font-black mb-2 block" style={{ color: "var(--text-3)" }}>نوع الإشعار</label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPES.map(t => (
                    <button key={t.value} onClick={() => setForm({ ...form, type: t.value })}
                      className="flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all"
                      style={{ borderColor: form.type === t.value ? t.color : "hsl(var(--border))", background: form.type === t.value ? t.color + "12" : "var(--surface)", color: form.type === t.value ? t.color : "var(--text-2)" }}>
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: "var(--text-3)" }}>الفصل المستهدف</label>
                  <select className="input-field text-sm" value={form.target_class_id} onChange={e => setForm({ ...form, target_class_id: e.target.value })}>
                    <option value="">جميع فصولي</option>
                    {myClasses.map((c: any) => <option key={c?.id} value={c?.id}>{c?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: "var(--text-3)" }}>العنوان *</label>
                  <input className="input-field" placeholder="مثال: اختبار الرياضيات الأسبوع القادم" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-black mb-1.5 block" style={{ color: "var(--text-3)" }}>التفاصيل *</label>
                  <textarea className="input-field" rows={4} placeholder="اكتب تفاصيل الإشعار..." value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} style={{ resize: "vertical" }} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={send} disabled={sending} className="btn btn-primary flex-1">
                  {sending ? <div className="spinner w-4 h-4 border-2" /> : <Send size={15} />} إرسال
                </button>
                <button onClick={() => setShowForm(false)} className="btn btn-secondary">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-state-icon">📬</div><div className="empty-state-title">لم ترسل إشعارات بعد</div><div className="empty-state-sub">أرسل إشعاراً لطلابك الآن</div></div></div>
          ) : notifications.map(n => {
            const t = typeInfo(n.type);
            return (
              <div key={n.id} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: t.color + "15" }}>{t.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm" style={{ color: "var(--text-1)" }}>{n.title}</span>
                    <span className="badge" style={{ background: t.color + "15", color: t.color }}>{t.label}</span>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>{n.body}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "var(--text-3)" }}>
                    <Clock size={11} /> {timeAgo(n.created_at)}
                  </div>
                </div>
                <button onClick={() => del(n.id)} className="btn btn-ghost btn-sm p-1.5 rounded-lg" style={{ color: "#ef4444" }}><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
