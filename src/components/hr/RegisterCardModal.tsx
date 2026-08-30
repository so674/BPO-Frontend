import { useState } from "react";
import Modal from "../ui/Modal";
import { registerCard } from "../../lib/api";

export default function RegisterCardModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [cardUid, setCardUid] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cardUid.trim()) {
      setError("Card UID is required");
      return;
    }
    setSubmitting(true);
    try {
      await registerCard(cardUid.trim());
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Register card" description="Adds a new RFID card in UNASSIGNED status." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 px-3 py-2 text-xs text-status-absent">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-steel-400">Card UID *</label>
          <input
            value={cardUid}
            onChange={(e) => setCardUid(e.target.value)}
            placeholder="CARD-45841"
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
            {submitting ? "Registering…" : "Register card"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
