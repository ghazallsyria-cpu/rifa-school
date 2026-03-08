import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "ar-SA") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatTime(time: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(`2000-01-01T${time}`));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getGradeColor(percentage: number): string {
  if (percentage >= 90) return "text-emerald-600";
  if (percentage >= 75) return "text-blue-600";
  if (percentage >= 60) return "text-yellow-600";
  if (percentage >= 50) return "text-orange-600";
  return "text-red-600";
}

export function getGradeLabel(percentage: number): string {
  if (percentage >= 90) return "ممتاز";
  if (percentage >= 75) return "جيد جداً";
  if (percentage >= 60) return "جيد";
  if (percentage >= 50) return "مقبول";
  return "راسب";
}

export function getAttendanceColor(status: string): string {
  switch (status) {
    case "present": return "bg-emerald-100 text-emerald-700";
    case "absent": return "bg-red-100 text-red-700";
    case "late": return "bg-yellow-100 text-yellow-700";
    case "excused": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function getAttendanceLabel(status: string): string {
  switch (status) {
    case "present": return "حاضر";
    case "absent": return "غائب";
    case "late": return "متأخر";
    case "excused": return "إذن";
    default: return status;
  }
}

export function getDayName(day: number): string {
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return days[day] || "";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("image")) return "🖼️";
  if (fileType.includes("video")) return "🎥";
  if (fileType.includes("audio")) return "🎵";
  if (fileType.includes("word") || fileType.includes("document")) return "📝";
  if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
  if (fileType.includes("presentation")) return "📊";
  return "📎";
}

export function calculateExamScore(answers: Array<{ is_correct: boolean | null; points_earned: number }>, maxGrade: number) {
  const earned = answers.reduce((sum, a) => sum + (a.points_earned || 0), 0);
  const percentage = maxGrade > 0 ? (earned / maxGrade) * 100 : 0;
  return { earned, percentage: Math.round(percentage * 10) / 10 };
}
