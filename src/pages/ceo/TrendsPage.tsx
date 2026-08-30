import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAttendance } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { formatDateLabel } from "../../lib/status";
import type { AttendanceStatus } from "../../types";

interface RecordRow {
  attendanceDate: string;
  status: AttendanceStatus;
}

const today = new Date();
const from = new Date(today);
from.setDate(today.getDate() - 6);
const fromStr = from.toISOString().slice(0, 10);
const toStr = today.toISOString().slice(0, 10);

export default function TrendsPage() {
  const { data: records, loading, error, reload } = useApi<RecordRow[]>(() =>
    getAttendance({ from: fromStr, to: toStr }),
  );

  const byDate = new Map<string, RecordRow[]>();
  (records ?? []).forEach((r) => {
    const list = byDate.get(r.attendanceDate) ?? [];
    list.push(r);
    byDate.set(r.attendanceDate, list);
  });

  const trend = Array.from(byDate.keys())
    .sort()
    .map((date) => {
      const dayRecords = byDate.get(date)!;
      const eligible = dayRecords.filter((r) => r.status !== "WEEK_OFF" && r.status !== "HOLIDAY").length;
      const present = dayRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
      return { date: formatDateLabel(date).slice(0, 6), rate: eligible ? Math.round((present / eligible) * 100) : 0 };
    });

  return (
    <div>
      <PageHeader
        eyebrow="CEO Portal"
        title="Trends &amp; analytics"
        description="Company-wide attendance rate over the last 7 days."
      />

      {loading && <LoadingState label="Loading trend data…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <Panel title="Attendance rate trend" eyebrow="Company-wide, %">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="#22304C" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#647391" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#647391" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#111A2E", border: "1px solid #22304C", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#E8ECF5" }}
                />
                <Line type="monotone" dataKey="rate" stroke="#7C8CD8" strokeWidth={2.5} dot={{ r: 3, fill: "#7C8CD8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </div>
  );
}
