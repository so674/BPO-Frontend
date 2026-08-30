import { ShieldCheck } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getAuditLogs } from "../../lib/api";
import { useApi } from "../../lib/useApi";

interface AuditRow {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

export default function AuditLog() {
  const { data: logs, loading, error, reload } = useApi<AuditRow[]>(() => getAuditLogs());

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="Audit log"
        description="Every privileged action is attributed to an actor, with the before/after state preserved."
      />

      <Panel>
        {loading && <LoadingState label="Loading audit trail…" />}
        {error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && (
          <div className="space-y-1">
            {(logs ?? []).map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-ink-800">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                  <ShieldCheck size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-steel-100">
                      <span className="font-medium">{log.actor}</span>{" "}
                      <span className="text-steel-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>{" "}
                      <span className="font-mono text-steel-400">{log.entityId.slice(0, 8)}</span>
                    </p>
                    <span className="font-mono text-[11px] text-steel-600">{log.timestamp.replace("T", " ").slice(0, 19)}</span>
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <p className="mt-1 font-mono text-xs text-steel-500">
                      {log.oldValue && <span className="text-status-absent/80">{log.oldValue}</span>}
                      {log.oldValue && log.newValue && <span className="mx-1.5 text-steel-600">→</span>}
                      {log.newValue && <span className="text-status-present/80">{log.newValue}</span>}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(logs ?? []).length === 0 && (
              <p className="py-8 text-center text-sm text-steel-500">No audit entries yet.</p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
