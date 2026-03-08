"use client";
import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card, Badge, Modal } from "@/components/ui/index";
import { FileText, CheckCircle, Clock, Star, Download, MessageSquare, Save } from "lucide-react";

const submissions = [
  { id: "1", student: "أحمد محمد علي", homework: "حل تمارين المعادلات", subject: "رياضيات", submittedAt: "2024-03-15 09:30", hasFile: true, fileName: "حل_المعادلات.pdf", status: "submitted", grade: null, feedback: "" },
  { id: "2", student: "محمد عبدالله حسن", homework: "حل تمارين المعادلات", subject: "رياضيات", submittedAt: "2024-03-15 11:20", hasFile: true, fileName: "محمد_واجب.pdf", status: "submitted", grade: null, feedback: "" },
  { id: "3", student: "عمر خالد محمود", homework: "حل تمارين المعادلات", subject: "رياضيات", submittedAt: "2024-03-14 20:45", hasFile: true, fileName: "omar_hw.pdf", status: "graded", grade: 17, feedback: "أحسنت! لكن راجع السؤال الثالث." },
  { id: "4", student: "يوسف سعد الدين", homework: "حل تمارين المعادلات", subject: "رياضيات", submittedAt: null, hasFile: false, fileName: "", status: "missing", grade: null, feedback: "" },
  { id: "5", student: "عبدالرحمن فاروق", homework: "حل تمارين المعادلات", subject: "رياضيات", submittedAt: "2024-03-15 22:10", hasFile: false, fileName: "", status: "submitted", grade: null, feedback: "" },
];

export default function TeacherHomework() {
  const [grading, setGrading] = useState<typeof submissions[0] | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const maxGrade = 20;

  const submitted = submissions.filter(s => s.status === "submitted").length;
  const graded = submissions.filter(s => s.status === "graded").length;
  const missing = submissions.filter(s => s.status === "missing").length;

  const openGrade = (sub: typeof submissions[0]) => {
    setGrading(sub);
    setGrade(sub.grade?.toString() || "");
    setFeedback(sub.feedback || "");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">الواجبات والتصحيح 📋</h1>
          <p className="page-subtitle">مراجعة وتصحيح واجبات الطلاب</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card text-center"><div className="text-2xl font-black text-blue-600">{submitted}</div><div className="text-xs text-gray-400 mt-1">بانتظار التصحيح</div></div>
          <div className="stat-card text-center"><div className="text-2xl font-black text-emerald-600">{graded}</div><div className="text-xs text-gray-400 mt-1">مُصحَّح</div></div>
          <div className="stat-card text-center"><div className="text-2xl font-black text-red-500">{missing}</div><div className="text-xs text-gray-400 mt-1">لم يسلّم</div></div>
        </div>

        {/* Homework selector */}
        <Card>
          <div className="flex gap-3">
            <select className="input-field py-2 flex-1">
              <option>حل تمارين المعادلات التربيعية - رياضيات</option>
              <option>تحليل نص قصيدة - عربي</option>
            </select>
            <select className="input-field py-2 w-40">
              <option>الصف الأول أ</option>
              <option>الصف الثاني ب</option>
            </select>
          </div>
        </Card>

        {/* Submissions Table */}
        <div className="table-container overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {["الطالب", "وقت التسليم", "الملف", "الحالة", "الدرجة", "إجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center justify-center">{sub.student[0]}</div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{sub.student}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString("ar-SA") : "—"}</td>
                  <td className="px-4 py-3">
                    {sub.hasFile ? (
                      <button className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        <FileText size={13} />{sub.fileName} <Download size={11} />
                      </button>
                    ) : <span className="text-xs text-gray-300 dark:text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.status === "graded" ? "success" : sub.status === "submitted" ? "info" : "danger"}>
                      {sub.status === "graded" ? "مُصحَّح" : sub.status === "submitted" ? "مُسلَّم" : "لم يسلّم"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {sub.grade !== null ? (
                      <span className={`font-black text-sm ${(sub.grade! / maxGrade) >= 0.8 ? "text-emerald-600" : "text-amber-600"}`}>{sub.grade}/{maxGrade}</span>
                    ) : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {sub.status !== "missing" && (
                      <button onClick={() => openGrade(sub)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-semibold hover:bg-primary-100 transition-colors">
                        <Star size={12} /> {sub.status === "graded" ? "تعديل" : "تصحيح"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading Modal */}
        <Modal open={!!grading} onClose={() => setGrading(null)} title={`تصحيح واجب: ${grading?.student}`} size="md">
          {grading && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">{grading.homework}</div>
                <div className="text-sm text-gray-500">{grading.subject} · الدرجة القصوى: {maxGrade}</div>
              </div>
              {grading.hasFile && (
                <button className="flex items-center gap-2 w-full p-3 border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 transition-colors">
                  <FileText size={16} /> {grading.fileName} — عرض الملف
                </button>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">الدرجة (من {maxGrade}) *</label>
                <input type="number" min="0" max={maxGrade} value={grade} onChange={e => setGrade(e.target.value)}
                  className="input-field text-left text-2xl font-black" dir="ltr" placeholder="0" />
                {grade && (
                  <div className="mt-2 text-sm text-gray-500">
                    {Math.round((parseInt(grade) / maxGrade) * 100)}% — {parseInt(grade) / maxGrade >= 0.9 ? "ممتاز 🌟" : parseInt(grade) / maxGrade >= 0.75 ? "جيد جداً ✨" : parseInt(grade) / maxGrade >= 0.6 ? "جيد 👍" : "بحاجة لتحسين"}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">تعليق للطالب</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                  className="input-field resize-none" rows={3} placeholder="أضف تعليقاً أو ملاحظة للطالب..." />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setGrading(null)}
                  className="flex-1 flex items-center justify-center gap-2 btn-primary py-3">
                  <Save size={16} /> حفظ الدرجة
                </button>
                <button onClick={() => setGrading(null)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
