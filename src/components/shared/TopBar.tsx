"use client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/useData";

export default function TopBar() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const loadUnread = async () => {
      const { count } = await supabase.from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .or(`target_role.eq.all,target_role.eq.${user.role}`);
      setUnread(count || 0);
    };
    loadUnread();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";
  const notifPath = `/${user?.role}/notifications`;

  return (
    <div className="fixed z-20 flex items-center justify-between px-6 h-16"
      style={{ top: 0, left: 0, right: "var(--sidebar-width)", background: "rgba(255,255,255,0.92)", borderBottom: "1px solid hsl(var(--border))", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "#94a3b8" }}>{greeting}،</span>
        <span className="font-black" style={{ color: "#0d1117" }}>{user?.full_name?.split(" ").slice(0, 2).join(" ")}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href={notifPath} className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "var(--surface-2)", color: "#64748b" }}>
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: "#ef4444", fontSize: "10px" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
