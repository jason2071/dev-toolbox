import type { ComponentProps, ReactNode } from "react";

// Minimal inline SVG icon set (stroke-based, 16px). Avoids an icon dependency.
type SvgProps = ComponentProps<"svg">;

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WandIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4V2M15 10V8M12.5 6.5h-2M19.5 6.5h-2" />
      <path d="m3 21 12-12M14.5 5.5 18 9" />
    </svg>
  );
}

export function ClipboardPasteIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function CopyIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CheckIcon(props: SvgProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// IconButton: square ghost button wrapping an icon, with an accessible label.
export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600"
    >
      {children}
    </button>
  );
}
