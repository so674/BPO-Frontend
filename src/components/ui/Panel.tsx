import type { ReactNode } from "react";

export default function Panel({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-ink-850 shadow-panel ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            {eyebrow && <p className="text-xs font-medium uppercase tracking-wider text-steel-500">{eyebrow}</p>}
            {title && <h3 className="font-display text-sm font-semibold text-steel-100">{title}</h3>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
