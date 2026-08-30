import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getDepartmentReport, getDepartments } from "../../lib/api";
import { useApi } from "../../lib/useApi";

interface DeptReportRow {
  department: string;
  present: number;
  total: number;
  rate: number;
}
interface DeptRow {
  id: string;
  name: string;
  headCount: number;
}

export default function DepartmentsPage() {
  const { data: report, loading: l1, error: e1, reload } = useApi<DeptReportRow[]>(() => getDepartmentReport());
  const { data: departments, loading: l2, error: e2 } = useApi<DeptRow[]>(() => getDepartments());

  const loading = l1 || l2;
  const error = e1 || e2;

  const headCountByName = new Map((departments ?? []).map((d) => [d.name, d.headCount]));

  return (
    <div>
      <PageHeader
        eyebrow="CEO Portal"
        title="Departments"
        description="Aggregate attendance and headcount by department. Individual records are not exposed at this scope."
      />

      {loading && <LoadingState label="Loading departments…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(report ?? []).map((d) => (
            <Panel key={d.department} title={d.department} eyebrow="Department">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl font-semibold text-steel-100 font-tabular">{d.rate}%</p>
                  <p className="text-xs text-steel-500">present today</p>
                </div>
                <p className="font-mono text-sm text-steel-400">{headCountByName.get(d.department) ?? d.total} staff</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
                <div className="h-full rounded-full bg-status-present" style={{ width: `${d.rate}%` }} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
