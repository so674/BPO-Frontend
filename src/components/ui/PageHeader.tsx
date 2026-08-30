import type { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-400">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-steel-100">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-steel-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
