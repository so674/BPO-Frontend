import { useState } from "react";
import { Download } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes, formatTime } from "../../lib/status";
import type { AttendanceStatus } from "../../types";
interface RecordRow {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number | null;
  lateMinutes: number;
  status: AttendanceStatus;
}

const filters: (AttendanceStatus | "ALL")[] = ["ALL", "PRESENT", "LATE", "ABSENT", "MISSING_PUNCH", "ON_LEAVE"];
const today = new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const [filter, setFilter] = useState<AttendanceStatus | "ALL">("ALL");
  const { data: records, loading, error, reload } = useApi<RecordRow[]>(() => getAttendance({ date: today }));

  const rows = (records ?? []).filter((r) => filter === "ALL" || r.status === filter);

  const handleExport = () => {
    const header = ["Employee", "Punch In", "Punch Out", "Working Minutes", "Late Minutes", "Status"];
    const csvRows = rows.map((r) => [
      r.employeeName,
      formatTime(r.punchIn),
      formatTime(r.punchOut),
      r.workingMinutes ?? "",
      r.lateMinutes,
      r.status,
    ]);
    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-${today}${filter !== "ALL" ? `-${filter.toLowerCase()}` : ""}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="Attendance management"
        description="Processed daily attendance records, derived from validated punch-in / punch-out events."
        action={
          <button
            onClick={handleExport}
            disabled={rows.length === 0}
            className="flex items-center gap-2 rounded-lg border border-line bg-ink-850 px-4 py-2 text-sm font-medium text-steel-300 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={14} /> Export
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "border-brand-500/50 bg-brand-500/15 text-brand-400"
                : "border-line bg-ink-850 text-steel-400 hover:text-steel-100"
            }`}
          >
            {f === "ALL" ? "All statuses" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      <Panel eyebrow={today} title="Daily attendance record">
        {loading && <LoadingState label="Loading attendance…" />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Punch In</th>
                  <th className="pb-3 font-medium">Punch Out</th>
                  <th className="pb-3 font-medium">Working Hours</th>
                  <th className="pb-3 font-medium">Late By</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-ink-800">
                    <td className="py-3 text-steel-100">{r.employeeName}</td>
                    <td className="py-3 font-mono text-steel-400">{formatTime(r.punchIn)}</td>
                    <td className="py-3 font-mono text-steel-400">{formatTime(r.punchOut)}</td>
                    <td className="py-3 font-mono text-steel-400">{formatMinutes(r.workingMinutes)}</td>
                    <td className="py-3 font-mono text-steel-400">{r.lateMinutes > 0 ? `${r.lateMinutes}m` : "—"}</td>
                    <td className="py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-steel-500">
                      No records match this filter for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
