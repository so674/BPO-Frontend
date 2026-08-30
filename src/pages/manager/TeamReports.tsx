import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getMonthlyReport } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes } from "../../lib/status";

interface MonthlyRow {
  employee_id: string;
  employee_name: string;
  present_days: number;
  late_days: number;
  absent_days: number;
  total_working_minutes: number;
}

export default function TeamReports() {
  const { data: monthly, loading, error, reload } = useApi<MonthlyRow[]>(() => getMonthlyReport());

  const chartData = (monthly ?? []).map((m) => ({
    name: m.employee_name.split(" ")[0],
    totalMinutes: m.total_working_minutes,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Manager Portal"
        title="Team reports"
        description="This month's working-hour totals and exception counts for your team."
      />

      {loading && <LoadingState label="Loading team reports…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <Panel title="Monthly working hours" eyebrow="Per team member">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#22304C" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#647391" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#647391" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111A2E", border: "1px solid #22304C", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#E8ECF5" }}
                    formatter={(v) => formatMinutes(Number(v))}
                  />
                  <Bar dataKey="totalMinutes" fill="#5561A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="mt-5">
            <Panel title="Exceptions this month" eyebrow="Late & absent counts">
              <div className="space-y-2.5">
                {(monthly ?? []).map((m) => (
                  <div key={m.employee_id} className="flex items-center justify-between rounded-lg border border-line bg-ink-900 px-3.5 py-2.5">
                    <span className="text-sm text-steel-300">{m.employee_name}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-status-late">{m.late_days} late</span>
                      <span className="text-status-absent">{m.absent_days} absent</span>
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
