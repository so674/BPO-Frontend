import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, DatabaseZap, ScanLine } from "lucide-react";

const steps = [
  { key: "tap", label: "Card presented", sub: "CARD-45821 → ENTRY-01", icon: CreditCard },
  { key: "validate", label: "Validating card + device", sub: "checking status, employee mapping", icon: ScanLine },
  { key: "store", label: "Event stored", sub: "EVT-10001 · PUNCH_IN · 09:05:00", icon: DatabaseZap },
  { key: "grant", label: "Attendance recorded", sub: "EMP1025 marked PRESENT", icon: CheckCircle2 },
];

export default function ReaderVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, []);

  const current = steps[step];
  const tapped = step > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-64 w-56 items-center justify-center">
        {/* the reader */}
        <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl border border-line bg-ink-800">
          <div className="absolute inset-3 overflow-hidden rounded-2xl border border-line/70 bg-ink-900">
            {step === 1 && (
              <div className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-brand-400/30 to-transparent animate-scan" />
            )}
          </div>
          <span
            className={`h-3 w-3 rounded-full transition-colors duration-500 ${
              step === 3 ? "bg-status-present" : step === 1 ? "bg-status-late" : "bg-steel-600"
            }`}
          />
        </div>

        {/* the card, tapping down onto the reader */}
        <div
          className={`absolute flex h-16 w-24 items-center justify-center rounded-lg border border-brand-400/40 bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg transition-all duration-700 ease-out ${
            tapped ? "-translate-y-2 opacity-90" : "-translate-y-24"
          }`}
        >
          <CreditCard size={20} className="text-steel-100/90" />
        </div>
      </div>

      <div className="mt-2 w-72 rounded-xl border border-line bg-ink-850 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
            <current.icon size={14} />
          </span>
          <div>
            <p className="text-sm font-medium text-steel-100">{current.label}</p>
            <p className="font-mono text-[11px] text-steel-500">{current.sub}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                i <= step ? "bg-brand-400" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
