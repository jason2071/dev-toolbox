import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json);

// JsonEditor is a small code editor (transparent textarea over a highlighted
// <pre>) for JSON input — gives the input the same syntax colors as the output
// panel. Highlighting is offline via highlight.js.
export function JsonEditor({
  id,
  value,
  onChange,
  minHeight = 420,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  minHeight?: number;
}) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-700 bg-[#1e1e2e] shadow-xl shadow-slate-900/10 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => hljs.highlight(code, { language: "json" }).value}
        padding={16}
        textareaId={id}
        className="hljs"
        style={{
          fontFamily: 'ui-monospace, "SFMono-Regular", "Consolas", monospace',
          fontSize: 13,
          lineHeight: 1.6,
          minHeight,
          color: "#e4e4f0",
          caretColor: "#e4e4f0",
        }}
      />
    </div>
  );
}
