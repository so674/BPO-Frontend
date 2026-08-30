import { useState } from "react";
import Modal from "../ui/Modal";
import { LoadingState } from "../ui/AsyncState";
import { assignCard, getEmployees } from "../../lib/api";
import { useApi } from "../../lib/useApi";

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export default function AssignCardModal({
  cardId,
  cardUid,
  onClose,
  onAssigned,
}: {
  cardId: string;
  cardUid: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const { data: employees, loading } = useApi<EmployeeOption[]>(() => getEmployees());
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!employeeId) {
      setError("Select an employee");
      return;
    }
    setSubmitting(true);
    try {
      await assignCard(cardId, employeeId);
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Assign card"
      description={`Assign card ${cardUid} to an employee. This also activates it.`}
      onClose={onClose}
    >
      {loading ? (
        <LoadingState label="Loading employees…" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 px-3 py-2 text-xs text-status-absent">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-steel-400">Employee *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink-900 px-3 py-2 text-sm text-steel-100 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Select employee…</option>
              {(employees ?? []).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
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
              {submitting ? "Assigning…" : "Assign card"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
