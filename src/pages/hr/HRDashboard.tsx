import { Users, UserCheck, Clock3, AlertTriangle, Router } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendanceSummary, getEvents, getDevices, getEmployees } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { deviceStatusMeta, formatTime } from "../../lib/status";
import type { AttendanceStatus, DeviceStatus, DeviceType } from "../../types";

interface SummaryResponse {
  date: string;
  summary: Record<AttendanceStatus, number>;
}
interface EventRow {
  id: string;
  employeeId: string;
  employeeName: string;
  deviceCode: string;
  eventType: "PUNCH_IN" | "PUNCH_OUT";
  eventTimestamp: string;
}
interface DeviceRow {
  id: string;
  deviceCode: string;
  location: string;
  type: DeviceType;
  status: DeviceStatus;
}
interface EmployeeRow {
  id: string;
  employmentStatus: "ACTIVE" | "INACTIVE";
}

export default function HRDashboard() {
  const { data: summaryRes, loading: l1, error: e1, reload: r1 } = useApi<SummaryResponse>(() => getAttendanceSummary());
  const { data: events, loading: l2, error: e2 } = useApi<EventRow[]>(() => getEvents({ limit: 8 }));
  const { data: devices, loading: l3, error: e3 } = useApi<DeviceRow[]>(() => getDevices());
  const { data: employees, loading: l4, error: e4 } = useApi<EmployeeRow[]>(() => getEmployees());

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  const summary = summaryRes?.summary;
  const activeEmployees = (employees ?? []).filter((e) => e.employmentStatus === "ACTIVE").length;

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal · Full Access"
        title="Today's attendance overview"
        description="A live snapshot of punches, exceptions and device health across all sites."
      />

      {loading && <LoadingState label="Loading dashboard…" />}
      {error && <ErrorState message={error} onRetry={r1} />}

      {!loading && !error && summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Active Employees" value={String(activeEmployees)} icon={Users} hint="across all departments" />
            <StatCard
              label="Present Today"
              value={String(summary.PRESENT)}
              icon={UserCheck}
              tone="present"
              hint={activeEmployees ? `${Math.round((summary.PRESENT / activeEmployees) * 100)}% of workforce` : undefined}
            />
            <StatCard label="Late Arrivals" value={String(summary.LATE)} icon={Clock3} tone="late" />
            <StatCard label="Absent" value={String(summary.ABSENT)} icon={AlertTriangle} tone="absent" />
            <StatCard label="Missing Punch" value={String(summary.MISSING_PUNCH)} icon={AlertTriangle} tone="missing" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Panel title="Live event stream" eyebrow="Attendance events" className="lg:col-span-2">
              <div className="space-y-1">
                {(events ?? []).map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-ink-800">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full ${e.eventType === "PUNCH_IN" ? "bg-status-present" : "bg-brand-400"}`}
                      />
                      <div>
                        <p className="text-sm text-steel-100">{e.employeeName}</p>
                        <p className="font-mono text-[11px] text-steel-500">{e.deviceCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-steel-300">
                        {e.eventType === "PUNCH_IN" ? "Punched in" : "Punched out"}
                      </p>
                      <p className="font-mono text-[11px] text-steel-500">{formatTime(e.eventTimestamp)}</p>
                    </div>
                  </div>
                ))}
                {(events ?? []).length === 0 && (
                  <p className="py-6 text-center text-sm text-steel-500">No events yet today.</p>
                )}
              </div>
            </Panel>

            <Panel title="Device health" eyebrow="Reader status">
              <div className="space-y-3">
                {(devices ?? []).map((d) => {
                  const meta = deviceStatusMeta[d.status];
                  return (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-800 text-steel-400">
                          <Router size={13} />
                        </span>
                        <div>
                          <p className="text-sm text-steel-100">{d.deviceCode}</p>
                          <p className="text-[11px] text-steel-500">{d.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
