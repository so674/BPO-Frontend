import { useEffect, useState } from "react";
import { Router, ArrowDownToLine, ArrowUpFromLine, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { LoadingState, ErrorState } from "../../components/ui/AsyncState";
import { getDevices } from "../../lib/api";
import { useApi } from "../../lib/useApi";
import { deviceStatusMeta } from "../../lib/status";
import type { DeviceStatus, DeviceType } from "../../types";

interface DeviceRow {
  id: string;
  deviceCode: string;
  name: string;
  location: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeenAt: string | null;
}

export default function Devices() {
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [query, setQuery] = useState(urlSearch);

  const {
    data: devices,
    loading,
    error,
    reload,
  } = useApi<DeviceRow[]>(() => getDevices());

  // Keep the search box synchronized with the URL.
  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  // Filter devices by device code, name, location, type, or status.
  const filteredDevices = (devices ?? []).filter((d) => {
    const searchText = `
      ${d.deviceCode}
      ${d.name}
      ${d.location}
      ${d.type}
      ${d.status}
    `.toLowerCase();

    return searchText.includes(query.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        eyebrow="HR Portal"
        title="RFID devices"
        description="Every reader has a unique device code. Readers observe and report — business rules stay in the backend."
      />

      <Panel>
        {/* DEVICE SEARCH */}
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-line bg-ink-900 px-3 py-2">
          <Search
            size={14}
            className="text-steel-500"
          />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by device code, name or location…"
            className="w-full bg-transparent text-sm text-steel-100 placeholder:text-steel-500 focus:outline-none"
          />
        </div>

        {loading && (
          <LoadingState label="Loading devices…" />
        )}

        {error && (
          <ErrorState
            message={error}
            onRetry={reload}
          />
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDevices.map((d) => {
              const meta = deviceStatusMeta[d.status];

              return (
                <Panel key={d.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-steel-300">
                        <Router size={18} />
                      </span>

                      <div>
                        <p className="font-mono text-sm font-medium text-steel-100">
                          {d.deviceCode}
                        </p>

                        <p className="text-xs text-steel-500">
                          {d.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                      />

                      <span
                        className={`text-xs font-medium ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs">
                    <div className="flex items-center gap-1.5 text-steel-400">
                      {d.type === "ENTRY" ? (
                        <ArrowDownToLine size={13} />
                      ) : (
                        <ArrowUpFromLine size={13} />
                      )}

                      {d.type === "ENTRY"
                        ? "Entry reader"
                        : "Exit reader"}
                    </div>

                    <span className="text-steel-500">
                      {d.location}
                    </span>
                  </div>

                  <div className="mt-2 font-mono text-[11px] text-steel-600">
                    last seen{" "}
                    {d.lastSeenAt
                      ? d.lastSeenAt
                          .replace("T", " ")
                          .slice(0, 19)
                      : "never"}
                  </div>
                </Panel>
              );
            })}

            {filteredDevices.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm text-steel-500">
                No devices match your search.
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}