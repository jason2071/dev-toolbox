import type { ReactNode } from "react";

// Panel is the shared white card used across tools: a header bar with an
// optional pill + title on the left and action buttons on the right, a body,
// and an optional footer. Pass flex/height classes via className.
export function Panel({
  title,
  pill,
  actions,
  footer,
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: ReactNode;
  pill?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title || pill || actions) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <div className="flex items-center gap-2">
            {pill && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {pill}
              </span>
            )}
            {title && (
              <span className="font-mono text-sm font-medium text-slate-600">
                {title}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      )}
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-3 py-2.5 text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}
