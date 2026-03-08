"use client";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }} dir="rtl">
      <Sidebar />
      <div className="lg:mr-[var(--sidebar-width)] min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 mt-16">
          <div className="page-wrap">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
