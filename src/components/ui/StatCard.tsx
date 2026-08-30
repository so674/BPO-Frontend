import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "present" | "late" | "absent" | "missing";
}) {
  const toneColor: Record<string, string> = {
    default: "text-brand-400 bg-brand-500/10",
    present: "text-status-present bg-status-present/10",
    late: "text-status-late bg-status-late/10",
    absent: "text-status-absent bg-status-absent/10",
    missing: "text-status-missing bg-status-missing/10",
  };

  return (
    <div className="rounded-xl border border-line bg-ink-850 p-5 shadow-panel">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-steel-500">{label}</p>
        <span className={`rounded-lg p-2 ${toneColor[tone]}`}>
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-steel-100 font-tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-steel-500">{hint}</p>}
    </div>
  );
}
