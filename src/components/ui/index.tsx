// ===== STAT CARD =====
export function StatCard({
  title, value, subtitle, icon, color = "gold", trend,
}: {
  title: string; value: string | number; subtitle?: string;
  icon: React.ReactNode; color?: "gold" | "white" | "dark" | "red" | "green";
  trend?: { value: number; label: string };
}) {
  const configs: Record<string, { iconBg: string; iconColor: string; accent: string }> = {
    gold: {
      iconBg: "linear-gradient(135deg, #c9970c, #a07808)",
      iconColor: "#fff",
      accent: "#c9970c",
    },
    white: {
      iconBg: "rgba(0,0,0,0.06)",
      iconColor: "#333",
      accent: "#555",
    },
    dark: {
      iconBg: "#0a0a0a",
      iconColor: "#c9970c",
      accent: "#c9970c",
    },
    red: {
      iconBg: "rgba(220,38,38,0.1)",
      iconColor: "#dc2626",
      accent: "#dc2626",
    },
    green: {
      iconBg: "rgba(34,197,94,0.1)",
      iconColor: "#16a34a",
      accent: "#16a34a",
    },
  };
  const cfg = configs[color] || configs.gold;
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{title}</p>
          <p className="text-3xl font-black" style={{ color: "hsl(var(--foreground))" }}>{value}</p>
          {subtitle && <p className="text-xs mt-1.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-bold"
              style={{ color: trend.value >= 0 ? "#16a34a" : "#dc2626" }}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>{trend.label}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3"
          style={{ background: cfg.iconBg, color: cfg.iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ===== BADGE =====
export function Badge({
  children, variant = "default", className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "danger" | "info" | "dark";
  className?: string;
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" },
    gold: { background: "rgba(184,134,11,0.14)", color: "#c9970c", border: "1px solid rgba(184,134,11,0.25)" },
    success: { background: "rgba(34,197,94,0.1)", color: "#16a34a" },
    warning: { background: "rgba(234,179,8,0.12)", color: "#ca8a04" },
    danger: { background: "rgba(220,38,38,0.1)", color: "#dc2626" },
    info: { background: "rgba(59,130,246,0.1)", color: "#2563eb" },
    dark: { background: "#0a0a0a", color: "#c9970c", border: "1px solid rgba(184,134,11,0.2)" },
  };
  return (
    <span className={`badge ${className}`} style={styles[variant]}>
      {children}
    </span>
  );
}

// ===== CARD =====
export function Card({
  children, className = "", title, subtitle, action,
}: {
  children: React.ReactNode; className?: string;
  title?: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className={`stat-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          <div>
            {title && <h3 className="font-black text-base" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>}
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// ===== GOLD DIVIDER =====
export function GoldDivider() {
  return <div className="gold-divider my-4" />;
}

// ===== EMPTY STATE =====
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(184,134,11,0.08)", color: "#c9970c" }}>
          {icon}
        </div>
      )}
      <h3 className="font-black text-lg mb-2" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
      {description && <p className="text-sm mb-6 max-w-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{description}</p>}
      {action}
    </div>
  );
}

// ===== LOADING SPINNER =====
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: 16, md: 24, lg: 36 }[size];
  return (
    <div className="flex items-center justify-center p-4">
      <div className="rounded-full border-2 animate-spin"
        style={{ width: s, height: s, borderColor: "rgba(184,134,11,0.2)", borderTopColor: "#c9970c" }} />
    </div>
  );
}

// ===== DATA TABLE =====
export function DataTable({
  columns, data, emptyText = "لا توجد بيانات",
}: {
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  data: Record<string, any>[];
  emptyText?: string;
}) {
  return (
    <div className="table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "hsl(var(--muted))", borderBottom: "2px solid rgba(184,134,11,0.2)" }}>
              {columns.map((col) => (
                <th key={col.key} className="px-5 py-3.5 text-right font-black text-xs"
                  style={{ color: "hsl(var(--muted-foreground))", letterSpacing: "0.04em" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted))"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4" style={{ color: "hsl(var(--foreground))" }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
