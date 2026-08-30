import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes, formatTime, formatDateLabel } from "../../lib/status";
import type { CurrentUser, AttendanceStatus } from "../../types";

interface RecordRow {
  id: string;
  attendanceDate: string;
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number | null;
  status: AttendanceStatus;
}

export default function History({ user: _user }: { user: CurrentUser }) {
  const { data, loading, error, reload } = useApi<RecordRow[]>(() => getAttendance());

  const rows = (data ?? []).sort((a, b) => (a.attendanceDate < b.attendanceDate ? 1 : -1));

  return (
    <div>
      <PageHeader eyebrow="Employee View" title="Attendance history" description="Your punch history, most recent first." />

      <Panel>
        {loading && <LoadingState label="Loading your history…" />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Punch In</th>
                  <th className="pb-3 font-medium">Punch Out</th>
                  <th className="pb-3 font-medium">Hours</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 text-steel-100">{formatDateLabel(r.attendanceDate)}</td>
                    <td className="py-3 font-mono text-steel-400">{formatTime(r.punchIn)}</td>
                    <td className="py-3 font-mono text-steel-400">{formatTime(r.punchOut)}</td>
                    <td className="py-3 font-mono text-steel-400">{formatMinutes(r.workingMinutes)}</td>
                    <td className="py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-steel-500">
                      No attendance records yet.
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
