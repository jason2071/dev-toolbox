import Editor from "react-simple-code-editor";

// jwt.io-style segment colors: header, payload, signature.
const SEGMENT_COLORS = ["#fb015b", "#d63aff", "#00b9f1"];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// highlightJwt colors each of the three dot-separated segments differently and
// dims the separating dots — the familiar JWT look.
function highlightJwt(code: string): string {
  const parts = code.split(".");
  const dot = '<span style="color:#6b7280">.</span>';
  return parts
    .map((p, i) => {
      const safe = escapeHtml(p);
      const color = SEGMENT_COLORS[i];
      return color ? `<span style="color:${color}">${safe}</span>` : safe;
    })
    .join(dot);
}

// TokenEditor is a code editor for JWT input that colors the three segments.
export function TokenEditor({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border border-slate-700 bg-[#1e1e2e] shadow-xl shadow-slate-900/10 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={highlightJwt}
        padding={16}
        textareaId={id}
        className="min-h-full flex-1"
        style={{
          fontFamily: 'ui-monospace, "SFMono-Regular", "Consolas", monospace',
          fontSize: 13,
          lineHeight: 1.7,
          wordBreak: "break-all",
          color: "#e4e4f0",
          caretColor: "#e4e4f0",
        }}
      />
    </div>
  );
}
