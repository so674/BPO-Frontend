import { useEffect, useState } from "react";
import { CreditCard, Ban, RefreshCw, UserPlus, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getCards, blockCard } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { cardStatusMeta } from "../../lib/status";
import type { CardStatus } from "../../types";
import RegisterCardModal from "../../components/hr/RegisterCardModal";
import AssignCardModal from "../../components/hr/AssignCardModal";
import ReplaceCardModal from "../../components/hr/ReplaceCardModal";

interface CardRow {
  id: string;
  cardUid: string;
  employeeId: string | null;
  employeeName: string | null;
  status: CardStatus;
  activatedAt: string | null;
}

export default function Cards() {
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [query, setQuery] = useState(urlSearch);

  const [showRegister, setShowRegister] = useState(false);
  const [assignTarget, setAssignTarget] = useState<CardRow | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<CardRow | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const {
    data: cards,
    loading,
    error,
    reload,
  } = useApi<CardRow[]>(() => getCards());

  // Keep the search box synchronized with the URL.
  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  // Filter cards by card UID, employee name, or status.
  const filteredCards = (cards ?? []).filter((c) => {
    const searchText = `
      ${c.cardUid}
      ${c.employeeName ?? ""}
      ${c.status}
    `.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  const handleBlock = async (id: string) => {
    setBlockingId(id);

    try {
      await blockCard(id);
      reload();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to block card",
      );
    } finally {
      setBlockingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="RFID cards"
        description="Registration, assignment, activation, blocking and replacement — the full card lifecycle."
        action={
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <CreditCard size={15} />
            Register card
          </button>
        }
      />

      {showRegister && (
        <RegisterCardModal
          onClose={() => setShowRegister(false)}
          onCreated={() => {
            setShowRegister(false);
            reload();
          }}
        />
      )}

      {assignTarget && (
        <AssignCardModal
          cardId={assignTarget.id}
          cardUid={assignTarget.cardUid}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => {
            setAssignTarget(null);
            reload();
          }}
        />
      )}

      {replaceTarget && (
        <ReplaceCardModal
          cardId={replaceTarget.id}
          oldCardUid={replaceTarget.cardUid}
          onClose={() => setReplaceTarget(null)}
          onReplaced={() => {
            setReplaceTarget(null);
            reload();
          }}
        />
      )}

      <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-xl border border-line bg-ink-850 px-5 py-4">
        {[
          "Unassigned",
          "Active",
          "Blocked",
          "Retired / Replaced",
        ].map((s, i, arr) => (
          <div
            key={s}
            className="flex items-center gap-2"
          >
            <span className="whitespace-nowrap rounded-full border border-line bg-ink-800 px-3 py-1.5 text-xs font-medium text-steel-300">
              {s}
            </span>

            {i < arr.length - 1 && (
              <span className="text-steel-600">
                →
              </span>
            )}
          </div>
        ))}
      </div>

      <Panel>
        {/* RFID CARD SEARCH */}
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-ink-900 px-3 py-2">
          <Search
            size={14}
            className="text-steel-500"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by card UID, employee or status…"
            className="w-full bg-transparent text-sm text-steel-100 placeholder:text-steel-500 focus:outline-none"
          />
        </div>

        {loading && (
          <LoadingState label="Loading cards…" />
        )}

        {error && (
          <ErrorState
            message={error}
            onRetry={reload}
          />
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wider text-steel-500">
                  <th className="pb-3 font-medium">
                    Card UID
                  </th>

                  <th className="pb-3 font-medium">
                    Assigned to
                  </th>

                  <th className="pb-3 font-medium">
                    Status
                  </th>

                  <th className="pb-3 font-medium">
                    Activated
                  </th>

                  <th className="pb-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {filteredCards.map((c) => {
                  const meta = cardStatusMeta[c.status];

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-ink-800"
                    >
                      <td className="py-3 font-mono text-steel-100">
                        {c.cardUid}
                      </td>

                      <td className="py-3 text-steel-300">
                        {c.employeeName ?? (
                          <span className="text-steel-600">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 text-steel-400">
                        {c.activatedAt
                          ? c.activatedAt.slice(0, 10)
                          : "—"}
                      </td>

                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          {c.status === "UNASSIGNED" && (
                            <button
                              onClick={() =>
                                setAssignTarget(c)
                              }
                              className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-brand-400 hover:bg-brand-500/10"
                            >
                              <UserPlus size={12} />
                              Assign
                            </button>
                          )}

                          {c.status === "ACTIVE" && (
                            <button
                              onClick={() =>
                                handleBlock(c.id)
                              }
                              disabled={
                                blockingId === c.id
                              }
                              className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-status-absent hover:bg-status-absent/10 disabled:opacity-50"
                            >
                              <Ban size={12} />

                              {blockingId === c.id
                                ? "Blocking…"
                                : "Block"}
                            </button>
                          )}

                          {c.status === "BLOCKED" && (
                            <button
                              onClick={() =>
                                setReplaceTarget(c)
                              }
                              className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs text-brand-400 hover:bg-brand-500/10"
                            >
                              <RefreshCw size={12} />
                              Replace
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCards.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-steel-500"
                    >
                      No cards match your search.
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