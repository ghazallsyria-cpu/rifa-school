'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Teacher {
  id: string;
  full_name: string;
  phone: string;
  specialization: string;
  is_active: boolean;
}

export default function TeachersManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', password: '12345', specialization: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const loadTeachers = async () => {
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').eq('role', 'teacher').order('created_at', { ascending: false });
    setTeachers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadTeachers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    if (editTeacher) {
      const updateData: Record<string, string> = { full_name: form.full_name, phone: form.phone, specialization: form.specialization };
      if (form.password) updateData.password = form.password;
      const { error } = await supabase.from('staff').update(updateData).eq('id', editTeacher.id);
      setMessage(error ? 'خطأ: ' + error.message : '✅ تم التحديث');
    } else {
      const { error } = await supabase.from('staff').insert({ full_name: form.full_name, phone: form.phone, password: form.password || '12345', specialization: form.specialization, role: 'teacher', is_active: true });
      setMessage(error ? 'خطأ: ' + error.message : '✅ تم الإضافة');
    }
    setSaving(false);
    setShowForm(false);
    setEditTeacher(null);
    setForm({ full_name: '', phone: '', password: '12345', specialization: '' });
    loadTeachers();
  };

  const toggleActive = async (t: Teacher) => {
    await supabase.from('staff').update({ is_active: !t.is_active }).eq('id', t.id);
    loadTeachers();
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    setForm({ full_name: t.full_name, phone: t.phone, password: '', specialization: t.specialization || '' });
    setShowForm(true);
  };

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة المعلمين</h1>
          <p className="text-gray-400 text-sm mt-1">الدخول برقم الموبايل + كلمة السر</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditTeacher(null); setForm({ full_name: '', phone: '', password: '12345', specialization: '' }); }}
          className="bg-[#c9970c] hover:bg-[#a07808] text-black font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
          + إضافة معلم
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm text-center border ${message.startsWith('✅') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#c9970c]/20 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">{editTeacher ? 'تعديل معلم' : 'إضافة معلم جديد'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">الاسم الكامل</label>
                <input type="text" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c9970c] text-right" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">رقم الموبايل</label>
                <input type="text" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  dir="ltr" className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c9970c]" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">كلمة المرور {editTeacher && <span className="text-gray-500 text-xs">(فارغة = بدون تغيير)</span>}</label>
                <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editTeacher ? 'اتركها فارغة لعدم التغيير' : '12345'}
                  className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c9970c]" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">التخصص / المادة</label>
                <input type="text" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                  placeholder="رياضيات، فيزياء، عربي..."
                  className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c9970c] text-right" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#c9970c] hover:bg-[#a07808] text-black font-bold py-2.5 rounded-xl disabled:opacity-50">
                  {saving ? 'جارٍ الحفظ...' : (editTeacher ? 'تحديث' : 'إضافة')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditTeacher(null); }}
                  className="flex-1 bg-[#1a1a1a] border border-[#c9970c]/20 text-gray-300 py-2.5 rounded-xl hover:bg-[#222]">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#c9970c]/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">جارٍ التحميل...</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-4xl mb-3">👨‍🏫</p>
            <p>لا يوجد معلمون مضافون بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#c9970c]/10 bg-[#0d0d0d]">
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">#</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">الاسم</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">رقم الموبايل</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">التخصص</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">الحالة</th>
                  <th className="text-right text-gray-400 text-xs font-medium px-5 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id} className="border-b border-[#c9970c]/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-sm">{i + 1}</td>
                    <td className="px-5 py-3.5 text-white font-medium">{t.full_name}</td>
                    <td className="px-5 py-3.5 text-gray-300 font-mono text-sm" dir="ltr">{t.phone}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-sm">{t.specialization || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${t.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {t.is_active ? 'مفعّل' : 'موقوف'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="bg-[#c9970c]/10 hover:bg-[#c9970c]/20 text-[#c9970c] border border-[#c9970c]/20 px-3 py-1 rounded-lg text-xs">تعديل</button>
                        <button onClick={() => toggleActive(t)} className={`px-3 py-1 rounded-lg text-xs border ${t.is_active ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {t.is_active ? 'إيقاف' : 'تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
