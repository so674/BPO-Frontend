import { Clock3, LogIn, LogOut, CreditCard } from "lucide-react";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import StatusBadge from "../../components/ui/StatusBadge";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance, getCards, reportLostCard } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes, formatTime } from "../../lib/status";
import type { AttendanceStatus, CardStatus, CurrentUser } from "../../types";

interface RecordRow {
  id: string;
  attendanceDate: string;
  punchIn: string | null;
  punchOut: string | null;
  workingMinutes: number | null;
  status: AttendanceStatus;
}
interface CardRow {
  cardUid: string;
  employeeId: string | null;
  status: CardStatus;
}

const today = new Date().toISOString().slice(0, 10);

export default function EmployeeDashboard({ user }: { user: CurrentUser }) {
  const { data: records, loading: l1, error: e1, reload } = useApi<RecordRow[]>(() => getAttendance({ date: today }));
  const { data: cards, loading: l2, error: e2, reload: reloadCards } = useApi<CardRow[]>(() => getCards());
  const [submitting, setSubmitting] = useState(false);

  const loading = l1 || l2;
  const error = e1 || e2;

  const todayRecord = (records ?? [])[0];
  const myCard = (cards ?? []).find((c) => c.employeeId === user.employeeId);

  const handleReportLost = async () => {
    if (!confirm("This will immediately block your current card and notify HR. Continue?")) return;
    setSubmitting(true);
    try {
      await reportLostCard();
      reloadCards();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to report card as lost");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Employee View"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your attendance for today, punched in via RFID card."
      />

      {loading && <LoadingState label="Loading your attendance…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Panel title="Today" eyebrow={today} className="lg:col-span-2">
            {todayRecord ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-line bg-ink-900 p-4">
                  <div className="flex items-center gap-2 text-status-present">
                    <LogIn size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Punch In</span>
                  </div>
                  <p className="mt-2 font-mono text-xl text-steel-100">{formatTime(todayRecord.punchIn)}</p>
                </div>
                <div className="rounded-lg border border-line bg-ink-900 p-4">
                  <div className="flex items-center gap-2 text-brand-400">
                    <LogOut size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Punch Out</span>
                  </div>
                  <p className="mt-2 font-mono text-xl text-steel-100">{formatTime(todayRecord.punchOut)}</p>
                </div>
                <div className="rounded-lg border border-line bg-ink-900 p-4">
                  <div className="flex items-center gap-2 text-steel-400">
                    <Clock3 size={14} />
                    <span className="text-xs font-medium uppercase tracking-wider">Hours</span>
                  </div>
                  <p className="mt-2 font-mono text-xl text-steel-100">{formatMinutes(todayRecord.workingMinutes)}</p>
                </div>
                <div className="col-span-3 flex items-center justify-between rounded-lg border border-line bg-ink-900 p-4">
                  <span className="text-sm text-steel-400">Today's status</span>
                  <StatusBadge status={todayRecord.status} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-steel-500">No attendance record yet for today.</p>
            )}
          </Panel>

          <Panel title="My RFID card" eyebrow="Access credential">
            <div className="flex flex-col items-center rounded-lg border border-line bg-gradient-to-br from-brand-500/20 to-ink-900 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                <CreditCard size={18} />
              </span>
              <p className="mt-3 font-mono text-sm text-steel-100">{myCard?.cardUid ?? "—"}</p>
              <span
                className={`mt-2 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  myCard?.status === "ACTIVE"
                    ? "border-status-present/30 bg-status-present/10 text-status-present"
                    : "border-status-absent/30 bg-status-absent/10 text-status-absent"
                }`}
              >
                {myCard?.status ?? "Unknown"}
              </span>
            </div>
            <button
              onClick={handleReportLost}
              disabled={submitting || myCard?.status !== "ACTIVE"}
              className="mt-4 w-full rounded-lg border border-line py-2 text-xs font-medium text-steel-400 hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Reporting…" : myCard?.status !== "ACTIVE" ? "No active card to report" : "Report lost card"}
            </button>
          </Panel>
        </div>
      )}
    </div>
  );
}
