"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LayoutDashboard, Users, BookOpen, GraduationCap, Home, Clock, Award, Megaphone, BarChart3, LogOut, Menu, X, Shield, Bell, ChevronRight, TrendingUp, UserCheck, BookMarked } from "lucide-react";

const adminNav = [
  { group: "الرئيسية", items: [
    { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  ]},
  { group: "الإدارة الأكاديمية", items: [
    { label: "الطلاب", href: "/admin/students", icon: GraduationCap },
    { label: "المعلمون", href: "/admin/teachers", icon: Users },
    { label: "الفصول والمواد", href: "/admin/classes", icon: Home },
  ]},
  { group: "التقارير والتحليل", items: [
    { label: "تحليل الدرجات", href: "/admin/grades", icon: Award },
    { label: "الحضور والغياب", href: "/admin/attendance", icon: Clock },
    { label: "الإحصاءات", href: "/admin/analytics", icon: BarChart3 },
  ]},
  { group: "التواصل", items: [
    { label: "الإشعارات", href: "/admin/notifications", icon: Bell },
    { label: "الإعلانات", href: "/admin/announcements", icon: Megaphone },
  ]},
];

const teacherNav = [
  { group: "الرئيسية", items: [
    { label: "لوحة التحكم", href: "/teacher", icon: LayoutDashboard },
    { label: "فصولي", href: "/teacher/classes", icon: Home },
  ]},
  { group: "التقييم", items: [
    { label: "رصد الدرجات", href: "/teacher/grades", icon: Award },
    { label: "الحضور", href: "/teacher/attendance", icon: Clock },
    { label: "أداء الطلاب", href: "/teacher/performance", icon: TrendingUp },
  ]},
  { group: "التواصل", items: [
    { label: "إرسال إشعار", href: "/teacher/notifications", icon: Bell },
  ]},
];

const studentNav = [
  { group: "الرئيسية", items: [
    { label: "لوحة التحكم", href: "/student", icon: LayoutDashboard },
  ]},
  { group: "أكاديمي", items: [
    { label: "درجاتي", href: "/student/grades", icon: Award },
    { label: "حضوري", href: "/student/attendance", icon: Clock },
  ]},
  { group: "التواصل", items: [
    { label: "الإشعارات", href: "/student/notifications", icon: Bell },
  ]},
];

const roleInfo: Record<string, { label: string; icon: any; gradient: string }> = {
  admin: { label: "مدير النظام", icon: Shield, gradient: "from-amber-600 to-yellow-500" },
  teacher: { label: "معلم", icon: BookOpen, gradient: "from-blue-600 to-indigo-500" },
  student: { label: "طالب", icon: GraduationCap, gradient: "from-emerald-600 to-teal-500" },
};

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const role = user?.role || "student";
  const navGroups = role === "admin" ? adminNav : role === "teacher" ? teacherNav : studentNav;
  const ri = roleInfo[role];
  const RoleIcon = ri.icon;

  const isActive = (href: string) => href === `/${role}` ? pathname === href : pathname.startsWith(href);

  const Nav = () => (
    <div className="flex flex-col h-full" style={{ background: "#080c14" }}>
      {/* Logo */}
      <div className="p-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #c9970c, #a07808)", boxShadow: "0 4px 14px rgba(201,151,12,0.4)" }}>
            <span className="text-white font-black text-lg">ر</span>
          </div>
          <div>
            <div className="text-sm font-black text-white leading-tight">الرفعة النموذجية</div>
            <div className="text-xs mt-0.5" style={{ color: "#475569" }}>المنصة التعليمية</div>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="mx-3 my-3 px-3 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br ${ri.gradient}`}>
            <RoleIcon size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black truncate text-white">{user?.full_name || "مستخدم"}</div>
            <div className="text-xs mt-0.5" style={{ color: "#c9970c" }}>{ri.label}</div>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1 scrollbar-thin">
        {navGroups.map(group => (
          <div key={group.group}>
            <div className="nav-group-label">{group.group}</div>
            {group.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={`nav-link ${active ? "active" : ""}`}>
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight size={13} style={{ color: "#c9970c" }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={signOut} className="nav-link w-full" style={{ color: "#64748b" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#080c14", border: "1px solid rgba(201,151,12,0.25)", color: "#c9970c" }}>
        <Menu size={20} />
      </button>

      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}

      {/* Mobile */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 z-50 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)", color: "#888" }}>
          <X size={16} />
        </button>
        <Nav />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block fixed top-0 right-0 h-full z-30" style={{ width: "var(--sidebar-width)" }}>
        <Nav />
      </div>
    </>
  );
}
