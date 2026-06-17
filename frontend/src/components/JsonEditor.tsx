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
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => hljs.highlight(code, { language: "json" }).value}
        padding={16}
        textareaId={id}
        className="hljs-light min-h-full flex-1"
        style={{
          fontFamily: 'ui-monospace, "SFMono-Regular", "Consolas", monospace',
          fontSize: 13,
          lineHeight: 1.6,
          color: "#1a2233",
          caretColor: "#1a2233",
        }}
      />
    </div>
  );
}
