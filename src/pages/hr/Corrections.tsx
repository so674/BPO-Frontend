import { Check, X, Clock } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getCorrections, decideCorrection } from "../../lib/api";
import { useApi } from "../../lib/useApi";

interface CorrectionRow {
  id: string;
  employeeId: string;
  correctionType: "PUNCH_IN" | "PUNCH_OUT" | "STATUS";
  oldValue: string | null;
  newValue: string;
  reason: string;
  requestedBy: string;
  approvedBy: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const statusStyle: Record<string, string> = {
  PENDING: "border-status-late/30 bg-status-late/10 text-status-late",
  APPROVED: "border-status-present/30 bg-status-present/10 text-status-present",
  REJECTED: "border-status-absent/30 bg-status-absent/10 text-status-absent",
};

export default function Corrections() {
  const { data: corrections, loading, error, reload } = useApi<CorrectionRow[]>(() => getCorrections());

  const handleDecision = async (id: string, decision: "APPROVED" | "REJECTED") => {
    try {
      await decideCorrection(id, decision);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record decision");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="Attendance corrections"
        description="No silent overwrites. Every correction records who, what changed, and why — before and after values are preserved."
      />

      {loading && <LoadingState label="Loading corrections…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="space-y-4">
          {(corrections ?? []).map((c) => (
            <Panel key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusStyle[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-steel-500">
                    {c.correctionType.replace("_", " ")} correction · requested by {c.requestedBy}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-steel-500">
                  <Clock size={12} /> {c.createdAt.replace("T", " ").slice(0, 19)}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-ink-900 px-4 py-3">
                <div className="font-mono text-sm text-status-absent line-through decoration-status-absent/60">
                  {c.oldValue ?? "—"}
                </div>
                <span className="text-steel-600">→</span>
                <div className="font-mono text-sm text-status-present">{c.newValue}</div>
              </div>

              <p className="mt-3 text-sm text-steel-400">
                <span className="text-steel-500">Reason: </span>
                {c.reason}
              </p>

              {c.status === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDecision(c.id, "APPROVED")}
                    className="flex items-center gap-1.5 rounded-lg bg-status-present/15 px-3.5 py-2 text-xs font-medium text-status-present hover:bg-status-present/25"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleDecision(c.id, "REJECTED")}
                    className="flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-medium text-steel-400 hover:bg-ink-800"
                  >
                    <X size={13} /> Reject
                  </button>
                </div>
              )}
              {c.approvedBy && <p className="mt-3 text-xs text-steel-500">Approved by {c.approvedBy}</p>}
            </Panel>
          ))}
          {(corrections ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-steel-500">No corrections have been requested.</p>
          )}
        </div>
      )}
    </div>
  );
}
