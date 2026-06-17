// Shared Tailwind class strings so the tool pages stay consistent and DRY.

export const ui = {
  section: "max-w-3xl",
  h1: "text-2xl font-extrabold tracking-tight text-slate-800",
  lead: "mt-1 text-slate-500",
  label:
    "text-xs font-semibold uppercase tracking-wide text-slate-500",
  field: "mb-4 flex flex-col gap-1.5",
  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-slate-800 shadow-sm transition " +
    "focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20",
  primary:
    "rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-[18px] py-2.5 text-sm font-semibold text-white " +
    "shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 " +
    "active:translate-y-0 disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none",
  secondary:
    "rounded-xl border-[1.5px] border-slate-200 bg-white px-[18px] py-2.5 text-sm font-semibold text-indigo-600 " +
    "transition hover:border-indigo-500 hover:bg-indigo-50",
  chip:
    "rounded-full border border-slate-200 bg-indigo-50 px-3 py-1 font-mono text-xs font-medium text-indigo-600 " +
    "transition hover:border-indigo-500 hover:bg-indigo-100",
  output:
    "overflow-auto rounded-xl border border-slate-700 bg-[#1e1e2e] p-4 font-mono text-[13px] leading-relaxed " +
    "text-slate-100 shadow-xl shadow-slate-900/10 whitespace-pre-wrap break-words",
  error:
    "mt-3.5 rounded-xl border border-red-300 border-l-4 border-l-red-500 bg-red-50 px-3.5 py-3 text-[13px] " +
    "text-red-700 shadow-sm",
  row: "mb-4 flex flex-wrap items-center gap-4",
};

export const badge = (ok: boolean) =>
  "inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-wide text-white shadow-md " +
  (ok
    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
    : "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30");
