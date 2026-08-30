import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes, formatTime, formatDateLabel } from "../../lib/status";
import type { AttendanceStatus } from "../../types";

interface RecordRow {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number | null;
  status: AttendanceStatus;
}

const today = new Date();
const from = new Date(today);
from.setDate(today.getDate() - 6);
const fromStr = from.toISOString().slice(0, 10);
const toStr = today.toISOString().slice(0, 10);

export default function TeamAttendance() {
  const { data: records, loading, error, reload } = useApi<RecordRow[]>(() =>
    getAttendance({ from: fromStr, to: toStr }),
  );

  const byDate = new Map<string, RecordRow[]>();
  (records ?? []).forEach((r) => {
    const list = byDate.get(r.attendanceDate) ?? [];
    list.push(r);
    byDate.set(r.attendanceDate, list);
  });
  const dates = Array.from(byDate.keys()).sort().reverse();

  return (
    <div>
      <PageHeader
        eyebrow="Manager Portal"
        title="Team attendance"
        description="Attendance history for your direct reports over the past 7 days."
      />

      {loading && <LoadingState label="Loading team history…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="space-y-5">
          {dates.map((date) => (
            <Panel key={date} eyebrow={formatDateLabel(date)} title="">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                      <th className="pb-2 font-medium">Employee</th>
                      <th className="pb-2 font-medium">In</th>
                      <th className="pb-2 font-medium">Out</th>
                      <th className="pb-2 font-medium">Hours</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {byDate.get(date)!.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 text-steel-100">{r.employeeName}</td>
                        <td className="py-2.5 font-mono text-steel-400">{formatTime(r.punchIn)}</td>
                        <td className="py-2.5 font-mono text-steel-400">{formatTime(r.punchOut)}</td>
                        <td className="py-2.5 font-mono text-steel-400">{formatMinutes(r.workingMinutes)}</td>
                        <td className="py-2.5">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ))}
          {dates.length === 0 && <p className="py-8 text-center text-sm text-steel-500">No records in this range.</p>}
        </div>
      )}
    </div>
  );
}
