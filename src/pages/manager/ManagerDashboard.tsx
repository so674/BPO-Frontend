import { Users, UserCheck, Clock3, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatTime } from "../../lib/status";
import type { AttendanceStatus } from "../../types";

interface RecordRow {
  id: string;
  employeeId: string;
  employeeName: string;
  punchIn: string | null;
  punchOut: string | null;
  status: AttendanceStatus;
}

const today = new Date().toISOString().slice(0, 10);

export default function ManagerDashboard() {
  const { data: records, loading, error, reload } = useApi<RecordRow[]>(() => getAttendance({ date: today }));

  const rows = records ?? [];
  const present = rows.filter((r) => r.status === "PRESENT").length;
  const late = rows.filter((r) => r.status === "LATE").length;
  const issues = rows.filter((r) => r.status === "ABSENT" || r.status === "MISSING_PUNCH").length;

  return (
    <div>
      <PageHeader
        eyebrow="Manager Portal · Team Access"
        title="Team overview"
        description="Attendance visibility for your direct reports, scoped to what you're authorized to see."
      />

      {loading && <LoadingState label="Loading team attendance…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Team Size" value={String(rows.length)} icon={Users} />
            <StatCard label="Present Today" value={String(present)} icon={UserCheck} tone="present" />
            <StatCard label="Late Arrivals" value={String(late)} icon={Clock3} tone="late" />
            <StatCard label="Needs Attention" value={String(issues)} icon={AlertTriangle} tone="absent" />
          </div>

          <div className="mt-5">
            <Panel title="Team attendance today" eyebrow="Direct reports">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                      <th className="pb-3 font-medium">Employee</th>
                      <th className="pb-3 font-medium">Punch In</th>
                      <th className="pb-3 font-medium">Punch Out</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 text-steel-100">{r.employeeName}</td>
                        <td className="py-3 font-mono text-steel-400">{formatTime(r.punchIn)}</td>
                        <td className="py-3 font-mono text-steel-400">{formatTime(r.punchOut)}</td>
                        <td className="py-3">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
