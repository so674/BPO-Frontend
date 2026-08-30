import { Loader2, AlertTriangle } from "lucide-react";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-steel-500">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-status-absent/10 text-status-absent">
        <AlertTriangle size={18} />
      </span>
      <p className="max-w-sm text-sm text-steel-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-line px-3.5 py-1.5 text-xs font-medium text-steel-300 hover:bg-ink-800"
        >
          Retry
        </button>
      )}
    </div>
  );
}
