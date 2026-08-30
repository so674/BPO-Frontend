import type { AttendanceStatus } from "../../types";
import { statusMeta } from "../../lib/status";

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
