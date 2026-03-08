import { createClient } from "@/lib/supabase";

export const supabase = createClient();

// Types
export interface Class { id: string; name: string; grade: string; section: string; track: string; }
export interface Student { national_id: string; full_name: string; class_id: string; grade: string; track: string; section: string; }
export interface Teacher { id: string; full_name: string; phone: string; subject: string; is_active: boolean; }
export interface Subject { id: string; name: string; grade?: string; }
export interface Grade { id: string; student_national_id: string; subject_id: string; marks_obtained: number; max_marks: number; exam_type: string; term: string; subjects?: { name: string }; student_profiles?: { full_name: string; class_id: string }; }
export interface Attendance { id: string; student_national_id: string; date: string; status: string; student_profiles?: { full_name: string }; }

export async function getClasses() {
  const { data } = await supabase.from("classes").select("*").eq("academic_year", "2025-2026").order("grade").order("track").order("section");
  return data as Class[] || [];
}

export async function getStudentsByClass(classId: string) {
  const { data } = await supabase.from("student_profiles").select("*").eq("class_id", classId).order("full_name");
  return data as Student[] || [];
}

export async function getGradesByClass(classId: string) {
  const { data } = await supabase
    .from("grades")
    .select("*, subjects(name), student_profiles!student_national_id(full_name, class_id)")
    .eq("student_profiles.class_id", classId);
  return data as Grade[] || [];
}

export async function getGradesByStudent(nationalId: string) {
  const { data } = await supabase
    .from("grades")
    .select("*, subjects(name)")
    .eq("student_national_id", nationalId)
    .order("term").order("created_at");
  return data as Grade[] || [];
}

export async function getAttendanceByClass(classId: string, date?: string) {
  let q = supabase.from("attendance").select("*, student_profiles!student_national_id(full_name)").eq("class_id", classId);
  if (date) q = q.eq("date", date);
  const { data } = await q.order("date", { ascending: false });
  return data as Attendance[] || [];
}

export async function getTeacherClasses(teacherId: string) {
  const { data } = await supabase
    .from("teacher_class_subjects")
    .select("*, classes(*), subjects(*)")
    .eq("teacher_id", teacherId);
  return data || [];
}

export async function getSubjects() {
  const { data } = await supabase.from("subjects").select("*").order("name");
  return data as Subject[] || [];
}
