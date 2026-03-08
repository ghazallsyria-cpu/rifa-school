"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
export type UserRole = "admin" | "teacher" | "student";
export interface AuthUser {
  id: string; full_name: string; role: UserRole;
  phone?: string; national_id?: string; class_id?: string;
  grade?: string; track?: string; section?: string; is_active?: boolean;
}
interface AuthContextType {
  user: AuthUser | null; loading: boolean;
  signIn: (identifier: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_KEY = "rifa_auth_user";
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  useEffect(() => {
    try { const s = localStorage.getItem(AUTH_KEY); if (s) setUser(JSON.parse(s)); } catch {}
    setLoading(false);
  }, []);
  const signIn = async (identifier: string, password: string, role: UserRole): Promise<{ error: string | null }> => {
    try {
      if (role === "student") {
        const { data, error } = await supabase.from("student_profiles").select("*").eq("national_id", identifier.trim()).eq("password_hash", password.trim()).single();
        if (error || !data) return { error: "الرقم المدني أو كلمة المرور غير صحيحة" };
        const u: AuthUser = { id: data.national_id, full_name: data.full_name, role: "student", national_id: data.national_id, class_id: data.class_id, grade: data.grade, track: data.track, section: data.section };
        localStorage.setItem(AUTH_KEY, JSON.stringify(u)); setUser(u); return { error: null };
      } else if (role === "teacher") {
        const { data, error } = await supabase.from("teacher_profiles").select("*").eq("phone", identifier.trim()).eq("password_hash", password.trim()).single();
        if (error || !data) return { error: "رقم الجوال أو كلمة المرور غير صحيحة" };
        if (data.is_active === false) return { error: "الحساب غير مفعّل. يرجى التواصل مع الإدارة." };
        const u: AuthUser = { id: data.id, full_name: data.full_name, role: "teacher", phone: data.phone, is_active: data.is_active };
        localStorage.setItem(AUTH_KEY, JSON.stringify(u)); setUser(u); return { error: null };
      } else {
        const { data, error } = await supabase.from("admin_profiles").select("*").eq("phone", identifier.trim()).eq("password_hash", password.trim()).single();
        if (error || !data) return { error: "رقم الجوال أو كلمة المرور غير صحيحة" };
        const u: AuthUser = { id: data.id, full_name: data.full_name, role: "admin", phone: data.phone };
        localStorage.setItem(AUTH_KEY, JSON.stringify(u)); setUser(u); return { error: null };
      }
    } catch (e) { return { error: "حدث خطأ غير متوقع" }; }
  };
  const signOut = () => { localStorage.removeItem(AUTH_KEY); setUser(null); window.location.href = "/auth/login"; };
  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
