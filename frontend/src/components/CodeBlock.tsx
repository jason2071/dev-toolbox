import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import go from "highlight.js/lib/languages/go";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import { ui } from "../ui";

hljs.registerLanguage("go", go);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);

type Lang = "go" | "json" | "typescript" | "python" | "rust";

// CodeBlock renders syntax-highlighted code. Default is the dark output panel;
// pass `light` for a white card (used by panels with their own chrome).
// Highlighting runs client-side via highlight.js (offline, no network).
export function CodeBlock({
  code,
  lang,
  className = "",
  light = false,
}: {
  code: string;
  lang: Lang;
  className?: string;
  light?: boolean;
}) {
  const html = useMemo(
    () => hljs.highlight(code, { language: lang }).value,
    [code, lang],
  );
  const pre = light
    ? "overflow-auto bg-white p-4 font-mono text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words"
    : ui.output;
  return (
    <pre className={`${pre} ${className}`}>
      <code
        className={light ? "hljs hljs-light" : "hljs"}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}
