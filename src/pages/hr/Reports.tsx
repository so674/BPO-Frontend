import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getDepartmentReport, getMonthlyReport } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatMinutes } from "../../lib/status";

interface DeptReportRow {
  department: string;
  present: number;
  total: number;
  rate: number;
}
interface MonthlyRow {
  employee_id: string;
  employee_name: string;
  present_days: number;
  late_days: number;
  absent_days: number;
  missing_punch_days: number;
  total_working_minutes: number;
}

export default function Reports() {
  const { data: deptReport, loading: l1, error: e1, reload: r1 } = useApi<DeptReportRow[]>(() => getDepartmentReport());
  const { data: monthly, loading: l2, error: e2 } = useApi<MonthlyRow[]>(() => getMonthlyReport());

  const loading = l1 || l2;
  const error = e1 || e2;

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="Reports &amp; analytics"
        description="Department attendance rates and monthly per-employee summaries."
      />

      {loading && <LoadingState label="Loading reports…" />}
      {error && <ErrorState message={error} onRetry={r1} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title="Department attendance today" eyebrow="Present / total">
            <div className="space-y-3">
              {(deptReport ?? []).map((d) => (
                <div key={d.department}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-steel-300">{d.department}</span>
                    <span className="font-mono text-xs text-steel-500">
                      {d.present}/{d.total} · {d.rate}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.rate}%` }} />
                  </div>
                </div>
              ))}
              {(deptReport ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-steel-500">No attendance recorded today yet.</p>
              )}
            </div>
          </Panel>

          <Panel title="Monthly summary" eyebrow="This month, per employee">
            <div className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
              {(monthly ?? []).map((m) => (
                <div key={m.employee_id} className="rounded-lg border border-line bg-ink-900 px-3.5 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-steel-100">{m.employee_name}</span>
                    <span className="font-mono text-xs text-steel-500">{formatMinutes(m.total_working_minutes)}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-[11px]">
                    <span className="text-status-present">{m.present_days} present</span>
                    <span className="text-status-late">{m.late_days} late</span>
                    <span className="text-status-absent">{m.absent_days} absent</span>
                    <span className="text-status-missing">{m.missing_punch_days} missing</span>
                  </div>
                </div>
              ))}
              {(monthly ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-steel-500">No records for this month yet.</p>
              )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
