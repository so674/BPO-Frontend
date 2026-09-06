import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { useApi } from "../../lib/useApi";
import { getTeamReport } from "../../lib/api";

export default function TeamReports() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Memoize the API call to prevent infinite re-render loops
  const fetchReport = useCallback(
    () => getTeamReport(selectedMonth),
    [selectedMonth]
  );

  const {
    data: apiData,
    loading,
    error,
    reload,
  } = useApi<any>(fetchReport);

  // Safely extract array records from various backend payload shapes
  const rawRows: any[] = Array.isArray(apiData)
    ? apiData
    : Array.isArray(apiData?.records)
    ? apiData.records
    : Array.isArray(apiData?.summary)
    ? apiData.summary
    : Array.isArray(apiData?.rows)
    ? apiData.rows
    : [];

  const reportList = rawRows
    .filter((r: any) => Boolean(r) && typeof r === "object")
    .map((r: any, idx: number) => {
      const workingMins = Number(
        r.totalWorkingMinutes ?? r.total_working_minutes ?? 0
      );
      const hrs = Math.floor(workingMins / 60);
      const mins = workingMins % 60;

      return {
        id: String(r.employeeId || r.employee_id || `emp-${idx}`),
        code: String(r.employeeCode || r.employee_code || "—"),
        name: String(r.employeeName || r.employee_name || "Unknown Employee"),
        department: String(
          r.departmentName || r.department_name || "Unassigned"
        ),
        present: Number(r.presentDays ?? r.present_days ?? 0),
        late: Number(r.lateDays ?? r.late_days ?? 0),
        absent: Number(r.absentDays ?? r.absent_days ?? 0),
        missing: Number(r.missingPunchDays ?? r.missing_punch_days ?? 0),
        formattedHours: `${hrs}h ${mins}m`,
      };
    });

  return (
    <div className="space-y-6">
      {/* Top escape and navigation bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-line bg-ink-900 px-3 py-1.5 text-xs text-steel-300 hover:bg-ink-800"
        >
          ← Back
        </button>
        <Link
          to="/dashboard"
          className="text-xs text-brand-400 hover:underline"
        >
          Go to Dashboard
        </Link>
      </div>

      <PageHeader
        eyebrow="Manager Portal"
        title="Team Attendance Reports"
        description="Monthly attendance metrics and working-hour summaries for your team."
      />

      <Panel>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-steel-400">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-line bg-ink-900 px-3 py-1.5 text-sm text-steel-100 focus:outline-none"
            />
          </div>
        </div>

        {loading && <LoadingState label="Generating team report…" />}

        {error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Code</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium text-center">Present</th>
                  <th className="pb-3 font-medium text-center">Late</th>
                  <th className="pb-3 font-medium text-center">Absent</th>
                  <th className="pb-3 font-medium text-center">Missing</th>
                  <th className="pb-3 font-medium text-right">Total Hours</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {reportList.map((row: any) => (
                  <tr key={row.id} className="hover:bg-ink-800">
                    <td className="py-3 font-medium text-steel-100">
                      {row.name}
                    </td>
                    <td className="py-3 font-mono text-steel-400">
                      {row.code}
                    </td>
                    <td className="py-3 text-steel-400">
                      {row.department}
                    </td>
                    <td className="py-3 text-center text-status-present font-semibold">
                      {row.present}
                    </td>
                    <td className="py-3 text-center text-status-late font-semibold">
                      {row.late}
                    </td>
                    <td className="py-3 text-center text-status-absent font-semibold">
                      {row.absent}
                    </td>
                    <td className="py-3 text-center text-status-missing font-semibold">
                      {row.missing}
                    </td>
                    <td className="py-3 text-right font-mono text-steel-300">
                      {row.formattedHours}
                    </td>
                  </tr>
                ))}

                {reportList.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-sm text-steel-500"
                    >
                      No team attendance records found for this period.
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