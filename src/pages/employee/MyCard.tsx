import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getCards, reportLostCard } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import type { CurrentUser, CardStatus } from "../../types";

interface CardRow {
  id: string;
  cardUid: string;
  status: CardStatus;
  activatedAt: string | null;
}

export default function MyCard({ user: _user }: { user: CurrentUser }) {
  const { data, loading, error, reload } = useApi<CardRow[]>(() => getCards());
  const card = (data ?? [])[0];
  const [submitting, setSubmitting] = useState(false);

  const handleReportLost = async () => {
    if (!confirm("This will immediately block your current card and notify HR. Continue?")) return;
    setSubmitting(true);
    try {
      await reportLostCard();
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to report card as lost");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Employee View" title="My card" description="Card status and lost-card reporting." />

      {loading && <LoadingState label="Loading your card…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel title="Card details" eyebrow="RFID credential">
            {card ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-steel-500">Card UID</dt>
                  <dd className="font-mono text-steel-100">{card.cardUid}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-steel-500">Status</dt>
                  <dd className={card.status === "ACTIVE" ? "text-status-present" : "text-status-absent"}>
                    {card.status}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-steel-500">Activated</dt>
                  <dd className="text-steel-300">{card.activatedAt ? card.activatedAt.slice(0, 10) : "—"}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-steel-500">No card is currently assigned to you.</p>
            )}
          </Panel>

          <Panel title="Lost or damaged card?" eyebrow="Report">
            <div className="flex items-start gap-3 rounded-lg border border-status-late/30 bg-status-late/10 p-4 text-sm text-steel-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-status-late" />
              <p>
                Reporting a lost card immediately blocks it and notifies HR to issue a replacement.
                Your attendance history stays linked to your employee profile.
              </p>
            </div>
            <button
              onClick={handleReportLost}
              disabled={submitting || card?.status !== "ACTIVE"}
              className="mt-4 w-full rounded-lg bg-status-absent/15 py-2.5 text-sm font-medium text-status-absent hover:bg-status-absent/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Reporting…" : card?.status !== "ACTIVE" ? "No active card to report" : "Report lost card"}
            </button>
          </Panel>
        </div>
      )}
    </div>
  );
}
