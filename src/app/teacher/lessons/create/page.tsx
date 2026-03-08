"use client";

import { useState } from "react";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card } from "@/components/ui/index";
import { Upload, X, FileText, Image, Video, Plus, Save, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  preview?: string;
}

export default function CreateLesson() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(f => {
      setFiles(prev => [...prev, {
        id: Math.random().toString(),
        name: f.name,
        type: f.type,
        size: (f.size / 1024 / 1024).toFixed(2) + " MB"
      }]);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    selected.forEach(f => {
      setFiles(prev => [...prev, {
        id: Math.random().toString(),
        name: f.name,
        type: f.type,
        size: (f.size / 1024 / 1024).toFixed(2) + " MB"
      }]);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText size={20} className="text-red-500" />;
    if (type.includes("image")) return <Image size={20} className="text-blue-500" />;
    if (type.includes("video")) return <Video size={20} className="text-purple-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/teacher/lessons"
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight size={18} />
          </Link>
          <div>
            <h1 className="page-title">إنشاء درس جديد 📖</h1>
            <p className="page-subtitle">أضف درسًا لطلابك مع ملفات ومقاطع فيديو</p>
          </div>
        </div>

        {/* Basic Info */}
        <Card title="معلومات الدرس الأساسية">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">عنوان الدرس *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="input-field" placeholder="مثال: المعادلات التربيعية" required />
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الفصل *</label>
              <select className="input-field" required>
                <option value="">اختر الفصل</option>
                <option>الصف الأول أ</option>
                <option>الصف الثاني ب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">ترتيب الدرس</label>
              <input type="number" min="1" className="input-field text-left" dir="ltr" placeholder="1" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" className="w-4 h-4 rounded" />
                <label htmlFor="published" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  نشر الدرس فوراً
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Lesson Content */}
        <Card title="محتوى الدرس">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">النص والشرح</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              className="input-field resize-none" rows={8}
              placeholder="اكتب محتوى الدرس هنا... يمكنك استخدام **نص غامق** و _نص مائل_ و [رابط](url)" />
            <div className="flex gap-2 flex-wrap">
              {["**نص غامق**", "_نص مائل_", "# عنوان", "## عنوان فرعي", "- نقطة", "1. قائمة مرقمة"].map(tag => (
                <button key={tag} type="button"
                  onClick={() => setContent(prev => prev + " " + tag)}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card title="الملفات والوسائط 📎">
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}
              onClick={() => document.getElementById("file-input")?.click()}>
              <Upload size={32} className={`mx-auto mb-3 ${isDragging ? "text-primary-500" : "text-gray-300"}`} />
              <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {isDragging ? "أفلت الملفات هنا" : "اسحب وأفلت الملفات"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">أو انقر للاختيار · PDF, صور, فيديو, ملفات</p>
              <input id="file-input" type="file" multiple className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,video/*"
                onChange={handleFileInput} />
            </div>

            {/* File Type Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "رفع PDF", icon: FileText, color: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800", accept: ".pdf" },
                { label: "رفع صورة", icon: Image, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800", accept: "image/*" },
                { label: "رفع فيديو", icon: Video, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800", accept: "video/*" },
              ].map(({ label, icon: Icon, color, accept }) => (
                <button key={label} type="button"
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file"; inp.accept = accept;
                    inp.onchange = (e: any) => {
                      const f = e.target.files?.[0];
                      if (f) setFiles(prev => [...prev, { id: Math.random().toString(), name: f.name, type: f.type, size: (f.size / 1024 / 1024).toFixed(2) + " MB" }]);
                    };
                    inp.click();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-sm ${color}`}>
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Uploaded Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">الملفات المرفوعة ({files.length})</h4>
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</div>
                      <div className="text-xs text-gray-400">{file.size}</div>
                    </div>
                    <button onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button"
            className="flex items-center gap-2 flex-1 btn-primary justify-center py-3.5">
            <Save size={18} /> حفظ الدرس
          </button>
          <button type="button"
            className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Eye size={18} /> معاينة
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
