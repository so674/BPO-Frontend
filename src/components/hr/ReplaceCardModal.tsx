import { useState } from "react";
import Modal from "../ui/Modal";
import { replaceCard } from "../../lib/api";

export default function ReplaceCardModal({
  cardId,
  oldCardUid,
  onClose,
  onReplaced,
}: {
  cardId: string;
  oldCardUid: string;
  onClose: () => void;
  onReplaced: () => void;
}) {
  const [newCardUid, setNewCardUid] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newCardUid.trim()) {
      setError("New card UID is required");
      return;
    }
    setSubmitting(true);
    try {
      await replaceCard(cardId, newCardUid.trim());
      onReplaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to replace card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Replace card"
      description={`Retires ${oldCardUid} and issues a new active card to the same employee.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 px-3 py-2 text-xs text-status-absent">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-400">New card UID *</label>
          <input
            value={newCardUid}
            onChange={(e) => setNewCardUid(e.target.value)}
            placeholder="CARD-45899"
            className="w-full rounded-lg border border-line bg-ink-900 px-3 py-2 text-sm font-mono text-steel-100 focus:border-brand-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-steel-300 hover:bg-ink-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? "Replacing…" : "Replace card"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
