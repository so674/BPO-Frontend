import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getEmployees, updateEmployeeStatus } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import AddEmployeeModal from "../../components/hr/AddEmployeeModal";

interface EmployeeRow {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string;
  designation: string;
  shiftName: string;
  employmentStatus: "ACTIVE" | "INACTIVE";
}

export default function Employees() {
  const [searchParams] = useSearchParams();

  // Get search value from the URL.
  // Example:
  // /hr/employees?search=Emp342
  const urlSearch = searchParams.get("search") ?? "";

  const [query, setQuery] = useState(urlSearch);

  const [showAddModal, setShowAddModal] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  const {
    data: employees,
    loading,
    error,
    reload,
  } = useApi<EmployeeRow[]>(() => getEmployees());

  // Keep the page search box synchronized with the URL.
  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  // Filter employees using the search query.
  const filtered = (employees ?? []).filter((e) =>
    `${e.firstName} ${e.lastName} ${e.employeeCode}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const handleToggleStatus = async (e: EmployeeRow) => {
    const next =
      e.employmentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    setStatusUpdatingId(e.id);

    try {
      await updateEmployeeStatus(e.id, next);
      reload();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update employee status",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="Employees"
        description="Organizational identity, department mapping and shift assignment."
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={15} />
            Add employee
          </button>
        }
      />

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            reload();
          }}
        />
      )}

      <Panel>
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-ink-900 px-3 py-2">
          <Search
            size={14}
            className="text-steel-500"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or employee code…"
            className="w-full bg-transparent text-sm text-steel-100 placeholder:text-steel-500 focus:outline-none"
          />
        </div>

        {loading && (
          <LoadingState label="Loading employees…" />
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
                    Employee
                  </th>

                  <th className="pb-3 font-medium">
                    Code
                  </th>

                  <th className="pb-3 font-medium">
                    Department
                  </th>

                  <th className="pb-3 font-medium">
                    Designation
                  </th>

                  <th className="pb-3 font-medium">
                    Shift
                  </th>

                  <th className="pb-3 font-medium">
                    Status
                  </th>

                  <th className="pb-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-line">
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-ink-800"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-steel-100">
                          {e.firstName[0]}
                          {e.lastName[0]}
                        </div>

                        <div>
                          <p className="text-steel-100">
                            {e.firstName} {e.lastName}
                          </p>

                          <p className="text-[11px] text-steel-500">
                            {e.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-steel-400">
                      {e.employeeCode}
                    </td>

                    <td className="py-3 text-steel-300">
                      {e.departmentName}
                    </td>

                    <td className="py-3 text-steel-300">
                      {e.designation}
                    </td>

                    <td className="py-3 text-steel-300">
                      {e.shiftName}
                    </td>

                    <td className="py-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                          e.employmentStatus === "ACTIVE"
                            ? "border-status-present/30 bg-status-present/10 text-status-present"
                            : "border-line text-steel-500"
                        }`}
                      >
                        {e.employmentStatus === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() =>
                          handleToggleStatus(e)
                        }
                        disabled={
                          statusUpdatingId === e.id
                        }
                        className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-steel-300 hover:bg-ink-800 disabled:opacity-50"
                      >
                        {statusUpdatingId === e.id
                          ? "Updating…"
                          : e.employmentStatus === "ACTIVE"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-sm text-steel-500"
                    >
                      No employees match your search.
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