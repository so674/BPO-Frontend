import { useState } from "react";
import Modal from "../ui/Modal";
import { LoadingState } from "../ui/AsyncState";
import { createEmployee, getDepartments, getShifts, getEmployees } from "../../lib/api";
import type { ApiValidationError } from "../../lib/api";
import { useApi } from "../../lib/useApi";

interface DeptOption {
  id: string;
  name: string;
}
interface ShiftOption {
  id: string;
  name: string;
  start: string;
  end: string;
}
interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  departmentId: "",
  designation: "",
  shiftId: "",
  managerId: "",
  joiningDate: today,
};

export default function AddEmployeeModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: departments, loading: loadingDepts } = useApi<DeptOption[]>(() => getDepartments());
  const { data: shifts, loading: loadingShifts } = useApi<ShiftOption[]>(() => getShifts());
  const { data: employees } = useApi<EmployeeOption[]>(() => getEmployees());

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.employeeCode.trim()) errs.employeeCode = "Required";
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.departmentId) errs.departmentId = "Required";
    if (!form.shiftId) errs.shiftId = "Required";
    if (!form.joiningDate) errs.joiningDate = "Required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createEmployee({
        employeeCode: form.employeeCode.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        departmentId: form.departmentId,
        designation: form.designation.trim() || undefined,
        shiftId: form.shiftId,
        managerId: form.managerId || null,
        joiningDate: form.joiningDate,
      });
      onCreated();
    } catch (err) {
      const apiErr = err as ApiValidationError;
      if (apiErr.details && apiErr.details.length > 0) {
        const mapped: Record<string, string> = {};
        apiErr.details.forEach((d) => {
          const key = String(d.path[0] ?? "");
          if (key) mapped[key] = d.message;
        });
        setFieldErrors(mapped);
        setFormError("Please fix the highlighted fields.");
      } else {
        setFormError(apiErr.message || "Failed to create employee");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg border bg-ink-900 px-3 py-2 text-sm text-steel-100 focus:outline-none ${
      hasError ? "border-status-absent/60" : "border-line focus:border-brand-500"
    }`;

  const loadingLookups = loadingDepts || loadingShifts;

  return (
    <Modal
      title="Add employee"
      description="Creates the employee record immediately in the database."
      onClose={onClose}
    >
      {loadingLookups ? (
        <LoadingState label="Loading departments &amp; shifts…" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-status-absent/30 bg-status-absent/10 px-3 py-2 text-xs text-status-absent">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Employee code *</label>
              <input
                value={form.employeeCode}
                onChange={setField("employeeCode")}
                placeholder="EMP1042"
                className={inputClass(!!fieldErrors.employeeCode)}
              />
              {fieldErrors.employeeCode && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.employeeCode}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Joining date *</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={setField("joiningDate")}
                className={inputClass(!!fieldErrors.joiningDate)}
              />
              {fieldErrors.joiningDate && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.joiningDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">First name *</label>
              <input value={form.firstName} onChange={setField("firstName")} className={inputClass(!!fieldErrors.firstName)} />
              {fieldErrors.firstName && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.firstName}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Last name *</label>
              <input value={form.lastName} onChange={setField("lastName")} className={inputClass(!!fieldErrors.lastName)} />
              {fieldErrors.lastName && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="name@bpocorp.com"
                className={inputClass(!!fieldErrors.email)}
              />
              {fieldErrors.email && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Phone</label>
              <input value={form.phone} onChange={setField("phone")} className={inputClass(false)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Department *</label>
              <select value={form.departmentId} onChange={setField("departmentId")} className={inputClass(!!fieldErrors.departmentId)}>
                <option value="">Select department…</option>
                {(departments ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {fieldErrors.departmentId && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.departmentId}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Shift *</label>
              <select value={form.shiftId} onChange={setField("shiftId")} className={inputClass(!!fieldErrors.shiftId)}>
                <option value="">Select shift…</option>
                {(shifts ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.start}–{s.end})</option>
                ))}
              </select>
              {fieldErrors.shiftId && <p className="mt-1 text-[11px] text-status-absent">{fieldErrors.shiftId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Designation</label>
              <input
                value={form.designation}
                onChange={setField("designation")}
                placeholder="Associate"
                className={inputClass(false)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-steel-400">Reporting manager</label>
              <select value={form.managerId} onChange={setField("managerId")} className={inputClass(false)}>
                <option value="">No manager</option>
                {(employees ?? []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.employeeCode})
                  </option>
                ))}
              </select>
            </div>
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
              {submitting ? "Creating…" : "Create employee"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
