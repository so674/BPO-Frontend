import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  getCards,
  getDevices,
} from "../../lib/api";

interface SearchResult {
  type: "Employee" | "Card" | "Device";
  title: string;
  subtitle: string;
  route: string;
}

export default function Topbar() {
  const navigate = useNavigate();

  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const search = async () => {
      const term = query.trim().toLowerCase();

      if (!term) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);

      try {
        const [employees, cards, devices] = await Promise.all([
          getEmployees(),
          getCards(),
          getDevices(),
        ]);

        const employeeResults: SearchResult[] = (
          employees as any[]
        )
          .filter((employee) => {
            const text = `
              ${employee.firstName ?? ""}
              ${employee.lastName ?? ""}
              ${employee.employeeCode ?? ""}
              ${employee.email ?? ""}
            `.toLowerCase();

            return text.includes(term);
          })
          .map((employee) => ({
            type: "Employee",
            title: `${employee.firstName ?? ""} ${
              employee.lastName ?? ""
            }`.trim(),
            subtitle:
              employee.employeeCode ??
              employee.email ??
              "",
            route: `/hr/employees?search=${encodeURIComponent(
              employee.employeeCode ?? "",
            )}`,
          }));

        const cardResults: SearchResult[] = (
          cards as any[]
        )
          .filter((card) => {
            const text = `
              ${card.cardUid ?? ""}
              ${card.employeeName ?? ""}
              ${card.status ?? ""}
            `.toLowerCase();

            return text.includes(term);
          })
          .map((card) => ({
            type: "Card",
            title: card.cardUid ?? "Unknown card",
            subtitle: card.employeeName
              ? `Assigned to ${card.employeeName}`
              : "Unassigned",
            route: `/hr/cards?search=${encodeURIComponent(
              card.cardUid ?? "",
            )}`,
          }));

        const deviceResults: SearchResult[] = (
          devices as any[]
        )
          .filter((device) => {
            const text = `
              ${device.deviceCode ?? ""}
              ${device.name ?? ""}
              ${device.location ?? ""}
              ${device.status ?? ""}
            `.toLowerCase();

            return text.includes(term);
          })
          .map((device) => ({
            type: "Device",
            title:
              device.deviceCode ??
              device.name ??
              "Unknown device",
            subtitle: `${device.name ?? ""}${
              device.location
                ? ` - ${device.location}`
                : ""
            }`,
            route: `/hr/devices?search=${encodeURIComponent(
              device.deviceCode ?? "",
            )}`,
          }));

        setResults(
          [
            ...employeeResults,
            ...cardResults,
            ...deviceResults,
          ].slice(0, 8),
        );
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(search, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const openResult = (result: SearchResult) => {
    navigate(result.route);
    setQuery("");
    setResults([]);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-ink-950/80 px-6 backdrop-blur">

      {/* SEARCH */}
      <div className="relative w-full max-w-md">

        <div className="flex items-center gap-2 rounded-lg border border-line bg-ink-900 px-3 py-1.5 text-sm text-steel-500">

          <Search size={14} />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                results.length > 0
              ) {
                openResult(results[0]);
              }
            }}
            placeholder="Search employees, cards, devices…"
            className="w-full bg-transparent text-steel-300 outline-none placeholder:text-steel-500"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              className="text-steel-500 hover:text-steel-300"
            >
              <X size={14} />
            </button>
          )}

        </div>

        {/* RESULTS */}
        {query.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-line bg-ink-900 shadow-xl">

            {searching && (
              <div className="px-4 py-3 text-sm text-steel-500">
                Searching...
              </div>
            )}

            {!searching &&
              results.length === 0 && (
                <div className="px-4 py-3 text-sm text-steel-500">
                  No results found.
                </div>
              )}

            {!searching &&
              results.length > 0 && (
                <div className="max-h-80 overflow-y-auto">

                  {results.map((result, index) => (
                    <button
                      type="button"
                      key={`${result.type}-${index}`}
                      onClick={() =>
                        openResult(result)
                      }
                      className="block w-full border-b border-line px-4 py-3 text-left last:border-b-0 hover:bg-ink-800"
                    >
                      <div className="text-sm text-steel-100">
                        {result.title}
                      </div>

                      <div className="mt-1 text-xs text-steel-500">
                        {result.type} ·{" "}
                        {result.subtitle}
                      </div>
                    </button>
                  ))}

                </div>
              )}

          </div>
        )}

      </div>

      {/* RIGHT SIDE */}
      <div className="ml-6 flex items-center gap-5">

        <div className="flex items-center gap-2 text-xs text-steel-400">

          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-status-present" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-present" />
          </span>

          Live sync active

        </div>

        <div className="font-mono text-sm text-steel-300 font-tabular">
          {now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>

      </div>

    </header>
  );
}