"use client";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Card } from "@/components/ui/index";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const monthlyData = [
  { month: "سبت", attendance: 93, grades: 78, submissions: 85 },
  { month: "أكت", attendance: 95, grades: 80, submissions: 88 },
  { month: "نوف", attendance: 91, grades: 77, submissions: 82 },
  { month: "ديس", attendance: 88, grades: 75, submissions: 79 },
  { month: "يناير", attendance: 94, grades: 82, submissions: 90 },
  { month: "فبر", attendance: 96, grades: 84, submissions: 92 },
  { month: "مارس", attendance: 94, grades: 83, submissions: 89 },
];

const subjectPerf = [
  { subject: "رياضيات", avg: 78, pass: 88, fail: 12 },
  { subject: "عربي", avg: 85, pass: 95, fail: 5 },
  { subject: "علوم", avg: 72, pass: 82, fail: 18 },
  { subject: "إنجليزي", avg: 68, pass: 75, fail: 25 },
  { subject: "تاريخ", avg: 82, pass: 91, fail: 9 },
  { subject: "جغرافيا", avg: 76, pass: 87, fail: 13 },
];

const gradesDist = [
  { name: "ممتاز 90+", value: 25, color: "#10b981" },
  { name: "جيد جداً 75-89", value: 35, color: "#0ea5e9" },
  { name: "جيد 60-74", value: 25, color: "#f59e0b" },
  { name: "مقبول 50-59", value: 10, color: "#f97316" },
  { name: "راسب <50", value: 5, color: "#ef4444" },
];

const classComparison = [
  { class: "1أ", avg: 83 }, { class: "1ب", avg: 79 }, { class: "2أ", avg: 77 },
  { class: "2ب", avg: 81 }, { class: "3أ", avg: 85 }, { class: "3ب", avg: 74 },
];

const radarData = [
  { subject: "رياضيات", value: 78 }, { subject: "عربي", value: 85 },
  { subject: "علوم", value: 72 }, { subject: "إنجليزي", value: 68 },
  { subject: "تاريخ", value: 82 }, { subject: "جغرافيا", value: 76 },
];

export default function AdminAnalytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">التقارير والتحليلات 📊</h1>
          <p className="page-subtitle">نظرة شاملة على الأداء الأكاديمي للمدرسة</p>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "متوسط الدرجات", value: "79.3%", change: "+2.1%", color: "text-emerald-600" },
            { label: "نسبة النجاح", value: "87.2%", change: "+1.5%", color: "text-emerald-600" },
            { label: "نسبة الحضور", value: "93.8%", change: "-0.5%", color: "text-red-500" },
            { label: "تسليم الواجبات", value: "88.4%", change: "+3.2%", color: "text-emerald-600" },
          ].map(k => (
            <div key={k.label} className="stat-card text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">{k.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">{k.label}</div>
              <span className={`text-xs font-bold ${k.color}`}>{k.change} عن الفصل الماضي</span>
            </div>
          ))}
        </div>

        {/* Monthly Trends */}
        <Card title="الاتجاهات الشهرية 📈" subtitle="مقارنة مؤشرات الأداء الرئيسية">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "Cairo" }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="attendance" name="الحضور" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="grades" name="الدرجات" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="submissions" name="التسليم" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {[{ color: "#10b981", label: "الحضور" }, { color: "#0ea5e9", label: "الدرجات" }, { color: "#f59e0b", label: "التسليم" }].map(l => (
              <div key={l.label} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} /><span className="text-xs text-gray-500">{l.label}</span></div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution */}
          <Card title="توزيع الدرجات 🎯">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gradesDist} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                  {gradesDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "12px" }} formatter={(v, n) => [`${v}%`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {gradesDist.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}: <strong>{item.value}%</strong></span>
                </div>
              ))}
            </div>
          </Card>

          {/* Class Comparison */}
          <Card title="مقارنة الفصول 🏫">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontFamily: "Cairo", borderRadius: "12px" }} formatter={(v: number) => [`${v}%`, "المتوسط"]} />
                <Bar dataKey="avg" fill="#0ea5e9" radius={[6, 6, 0, 0]}
                  label={{ position: "top", fontSize: 10, fill: "#6b7280" }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance */}
          <Card title="أداء المواد الدراسية 📚">
            <div className="space-y-4">
              {subjectPerf.map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{s.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-600 font-semibold">✓ {s.pass}%</span>
                      <span className="text-xs text-red-500 font-semibold">✗ {s.fail}%</span>
                      <span className="text-sm font-black text-gray-800 dark:text-gray-200">{s.avg}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all" style={{ width: `${s.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Radar Chart */}
          <Card title="نظرة شاملة على الأداء 🎯">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: "Cairo" }} />
                <Radar dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
