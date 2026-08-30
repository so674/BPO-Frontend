import { Users, TrendingUp, Building2, Percent } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendanceSummary, getEmployees, getDepartmentReport } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import type { AttendanceStatus } from "../../types";

interface SummaryResponse {
  summary: Record<AttendanceStatus, number>;
}
interface EmployeeRow {
  employmentStatus: "ACTIVE" | "INACTIVE";
}
interface DeptReportRow {
  department: string;
  present: number;
  total: number;
  rate: number;
}

export default function CEODashboard() {
  const { data: summaryRes, loading: l1, error: e1, reload } = useApi<SummaryResponse>(() => getAttendanceSummary());
  const { data: employees, loading: l2, error: e2 } = useApi<EmployeeRow[]>(() => getEmployees());
  const { data: deptReport, loading: l3, error: e3 } = useApi<DeptReportRow[]>(() => getDepartmentReport());

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;

  const summary = summaryRes?.summary;
  const activeEmployees = (employees ?? []).filter((e) => e.employmentStatus === "ACTIVE").length;
  const present = summary ? summary.PRESENT + summary.LATE : 0;
  const attendanceRate = activeEmployees ? Math.round((present / activeEmployees) * 100) : 0;

  const pieData = summary
    ? [
        { name: "Present", value: summary.PRESENT, color: "#34B27B" },
        { name: "Late", value: summary.LATE, color: "#E3A23C" },
        { name: "Absent", value: summary.ABSENT, color: "#E15656" },
        { name: "On leave / off", value: summary.ON_LEAVE + summary.WEEK_OFF, color: "#6B7A99" },
      ]
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="CEO Portal · Read-only"
        title="Company overview"
        description="Company-wide attendance insight. Administrative actions are scoped to HR."
      />

      {loading && <LoadingState label="Loading company overview…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Workforce" value={String(activeEmployees)} icon={Users} />
            <StatCard label="Attendance Rate" value={`${attendanceRate}%`} icon={Percent} tone="present" />
            <StatCard label="Departments" value={String((deptReport ?? []).length)} icon={Building2} />
            <StatCard label="Trend" value="—" icon={TrendingUp} hint="see Trends tab" />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Panel title="Today's composition" eyebrow="Company-wide" className="lg:col-span-1">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111A2E", border: "1px solid #22304C", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#8B9AB8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Department snapshot" eyebrow="Attendance rate today" className="lg:col-span-2">
              <div className="space-y-3.5">
                {(deptReport ?? []).map((d) => (
                  <div key={d.department}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-300">{d.department}</span>
                      <span className="font-mono text-xs text-steel-500">{d.rate}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
