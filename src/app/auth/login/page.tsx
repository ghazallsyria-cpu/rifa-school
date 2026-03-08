'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type LoginType = 'student' | 'staff';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();

    try {
      if (loginType === 'student') {
        const { data, error: dbError } = await supabase
          .from('students')
          .select('*')
          .eq('national_id', identifier.trim())
          .eq('password', password.trim())
          .eq('is_active', true)
          .single();

        if (dbError || !data) {
          setError('الرقم المدني أو كلمة المرور غير صحيحة');
          setLoading(false);
          return;
        }
        localStorage.setItem('rifa_user', JSON.stringify({
          id: data.id, role: 'student', name: data.full_name,
          national_id: data.national_id, class_id: data.class_id,
          grade: data.grade, track: data.track, section: data.section,
        }));
        router.push('/student');
      } else {
        const { data, error: dbError } = await supabase
          .from('staff')
          .select('*')
          .eq('phone', identifier.trim())
          .eq('password', password.trim())
          .eq('is_active', true)
          .single();

        if (dbError || !data) {
          setError('رقم الموبايل أو كلمة المرور غير صحيحة');
          setLoading(false);
          return;
        }
        localStorage.setItem('rifa_user', JSON.stringify({
          id: data.id, role: data.role, name: data.full_name,
          phone: data.phone, specialization: data.specialization,
        }));
        router.push(data.role === 'admin' ? '/admin' : '/teacher');
      }
    } catch {
      setError('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex" dir="rtl">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#111] to-[#1a1400]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #c9970c 0%, transparent 50%)' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-28 h-28 mx-auto mb-8 rounded-full border-4 border-[#c9970c] flex items-center justify-center bg-[#c9970c]/10">
            <span className="text-5xl">🏫</span>
          </div>
          <h1 className="text-4xl font-bold text-[#c9970c] mb-3">الرفعة النموذجية</h1>
          <p className="text-gray-400 text-lg mb-2">الثانوية للبنين - المشتركة</p>
          <p className="text-gray-500 text-sm">العام الدراسي 2025 / 2026</p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[{ num: '430', label: 'طالب' }, { num: '18', label: 'فصل' }, { num: '3', label: 'مراحل' }].map((s) => (
              <div key={s.label} className="border border-[#c9970c]/20 rounded-xl p-4 bg-[#c9970c]/5">
                <div className="text-2xl font-bold text-[#c9970c]">{s.num}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-[#c9970c]">الرفعة النموذجية</h1>
            <p className="text-gray-500 text-sm mt-1">الثانوية للبنين</p>
          </div>
          <div className="bg-[#111] border border-[#c9970c]/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm text-center mb-8">مرحباً بك في النظام التعليمي</p>

            <div className="flex bg-[#1a1a1a] rounded-xl p-1 mb-6">
              {(['student', 'staff'] as LoginType[]).map((type) => (
                <button key={type} onClick={() => { setLoginType(type); setIdentifier(''); setPassword(''); setError(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${loginType === type ? 'bg-[#c9970c] text-black shadow' : 'text-gray-400 hover:text-white'}`}>
                  {type === 'student' ? '🎓 طالب' : '👔 معلم / إدارة'}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {loginType === 'student' ? '🪪 الرقم المدني' : '📱 رقم الموبايل'}
                </label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={loginType === 'student' ? 'أدخل رقمك المدني' : 'أدخل رقم موبايلك'}
                  required dir="ltr"
                  className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#c9970c] focus:ring-1 focus:ring-[#c9970c]/50 placeholder-gray-600 transition-all text-right" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">🔒 كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور" required
                  className="w-full bg-[#1a1a1a] border border-[#c9970c]/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#c9970c] focus:ring-1 focus:ring-[#c9970c]/50 placeholder-gray-600 transition-all text-right" />
                {loginType === 'student' && <p className="text-gray-600 text-xs mt-1.5">كلمة المرور الافتراضية: 12345</p>}
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">⚠️ {error}</div>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-[#c9970c] hover:bg-[#a07808] text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-[#c9970c]/20 text-base">
                {loading ? 'جارٍ التحقق...' : 'دخول'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-xl border border-[#c9970c]/10">
              <p className="text-gray-500 text-xs text-center mb-2">للتجربة السريعة:</p>
              {loginType === 'student' ? (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">استخدم أي رقم مدني من قائمة الطلاب</p>
                  <p className="text-[#c9970c] text-xs mt-1">كلمة السر: <span className="font-mono font-bold">12345</span></p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">مدير: <span className="font-mono text-[#c9970c]">55315661</span></p>
                  <p className="text-gray-400 text-xs mt-0.5">كلمة السر: <span className="font-mono text-[#c9970c]">55315661</span></p>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-6">إدارة التعليم الخاص — مدرسة الرفعة النموذجية للبنين</p>
        </div>
      </div>
    </div>
  );
}
