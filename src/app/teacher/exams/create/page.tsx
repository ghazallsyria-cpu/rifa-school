"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Modal } from "@/components/ui/index";
import { Plus, Trash2, Image, FileText, MoveUp, MoveDown, Save, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  text: string;
  points: number;
  options: Option[];
  imageUrl?: string;
}

export default function CreateExam() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const addQuestion = (type: Question["type"]) => {
    const q: Question = {
      id: Math.random().toString(),
      type,
      text: "",
      points: 5,
      options: type === "multiple_choice"
        ? [
          { id: "a", text: "", isCorrect: false },
          { id: "b", text: "", isCorrect: false },
          { id: "c", text: "", isCorrect: false },
          { id: "d", text: "", isCorrect: false },
        ]
        : type === "true_false"
        ? [
          { id: "t", text: "صح", isCorrect: true },
          { id: "f", text: "خطأ", isCorrect: false },
        ]
        : [],
    };
    setQuestions(prev => [...prev, q]);
    setActiveQuestion(q.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const updateOption = (qId: string, optId: string, text: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, text } : o) } : q
    ));
  };

  const setCorrectOption = (qId: string, optId: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optId })) } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    if (activeQuestion === id) setActiveQuestion(null);
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const typeLabels = {
    multiple_choice: "اختيار من متعدد",
    true_false: "صح / خطأ",
    short_answer: "إجابة قصيرة",
    essay: "مقالي",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/teacher/exams"
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight size={18} />
          </Link>
          <div>
            <h1 className="page-title">إنشاء اختبار جديد ✏️</h1>
            <p className="page-subtitle">أضف أسئلة وحدد الإجابات الصحيحة للتصحيح التلقائي</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Settings */}
          <div className="space-y-4 lg:col-span-1">
            <Card title="إعدادات الاختبار">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">عنوان الاختبار *</label>
                  <input type="text" className="input-field" placeholder="اختبار الفصل الأول" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">المادة *</label>
                  <select className="input-field" required>
                    <option value="">اختر المادة</option>
                    <option>رياضيات</option>
                    <option>عربي</option>
                    <option>علوم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الفصل الدراسي *</label>
                  <select className="input-field" required>
                    <option value="">اختر الفصل</option>
                    <option>الصف الأول أ</option>
                    <option>الصف الثاني ب</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">المدة (دقيقة)</label>
                  <input type="number" className="input-field text-left" dir="ltr" placeholder="60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">تاريخ البداية</label>
                  <input type="datetime-local" className="input-field text-left" dir="ltr" />
                </div>
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">عدد الأسئلة:</span>
                    <span className="font-bold text-primary-600">{questions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">إجمالي الدرجات:</span>
                    <span className="font-bold text-primary-600">{totalPoints}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Add Question Types */}
            <Card title="إضافة سؤال">
              <div className="space-y-2">
                {(["multiple_choice", "true_false", "short_answer", "essay"] as const).map(type => (
                  <button key={type} onClick={() => addQuestion(type)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-200 dark:hover:border-primary-700 transition-all text-right">
                    <Plus size={16} className="text-primary-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{typeLabels[type]}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Questions Builder */}
          <div className="lg:col-span-2 space-y-4">
            {questions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600 p-16 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-bold text-gray-600 dark:text-gray-400 text-lg mb-2">لا توجد أسئلة بعد</h3>
                <p className="text-gray-400 dark:text-gray-500 text-sm">اختر نوع السؤال من القائمة الجانبية لإضافة أسئلة</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm transition-all ${activeQuestion === q.id ? "border-primary-300 dark:border-primary-600 shadow-primary-100 dark:shadow-none" : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"}`}
                  onClick={() => setActiveQuestion(q.id)}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full">
                      {typeLabels[q.type]}
                    </span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1.5">
                      <input type="number" min="1" value={q.points}
                        onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                        className="w-16 text-center border border-gray-200 dark:border-gray-600 rounded-lg py-1 text-sm font-semibold bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onClick={(e) => e.stopPropagation()} />
                      <span className="text-xs text-gray-400">درجة</span>
                      <button onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors mr-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <textarea value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="input-field resize-none" rows={2}
                      placeholder="اكتب نص السؤال هنا..." />

                    {/* Options for MC */}
                    {q.type === "multiple_choice" && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">الخيارات (انقر على الدائرة لتحديد الإجابة الصحيحة)</p>
                        {q.options.map((opt, oi) => (
                          <div key={opt.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${opt.isCorrect ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-100 dark:border-gray-700"}`}>
                            <button onClick={(e) => { e.stopPropagation(); setCorrectOption(q.id, opt.id); }}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-gray-300 dark:border-gray-500 hover:border-emerald-400"}`}>
                              {opt.isCorrect && <CheckCircle size={14} className="text-white" />}
                            </button>
                            <span className="text-sm font-bold text-gray-500 w-6">{["أ", "ب", "ج", "د"][oi]}</span>
                            <input type="text" value={opt.text}
                              onChange={(e) => { e.stopPropagation(); updateOption(q.id, opt.id, e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600"
                              placeholder={`الخيار ${["الأول", "الثاني", "الثالث", "الرابع"][oi]}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {q.type === "true_false" && (
                      <div className="flex gap-3">
                        {q.options.map(opt => (
                          <button key={opt.id} onClick={(e) => { e.stopPropagation(); setCorrectOption(q.id, opt.id); }}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${opt.isCorrect ? opt.id === "t" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700" : "border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300"}`}>
                            {opt.text} {opt.isCorrect && "✓"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Short Answer / Essay */}
                    {(q.type === "short_answer" || q.type === "essay") && (
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">نموذج الإجابة (اختياري)</p>
                        <textarea className="input-field resize-none" rows={q.type === "essay" ? 3 : 1}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="أدخل نموذج الإجابة الصحيحة..." />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Actions */}
            {questions.length > 0 && (
              <div className="flex gap-3">
                <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5">
                  <Save size={18} /> حفظ الاختبار
                </button>
                <button className="px-6 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  نشر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
