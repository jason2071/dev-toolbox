import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import go from "highlight.js/lib/languages/go";
import json from "highlight.js/lib/languages/json";
import { ui } from "../ui";

hljs.registerLanguage("go", go);
hljs.registerLanguage("json", json);

type Lang = "go" | "json";

// CodeBlock renders syntax-highlighted code in the shared dark output panel.
// Highlighting runs client-side via highlight.js (offline, no network).
export function CodeBlock({
  code,
  lang,
  className = "",
}: {
  code: string;
  lang: Lang;
  className?: string;
}) {
  const html = useMemo(
    () => hljs.highlight(code, { language: lang }).value,
    [code, lang],
  );
  return (
    <pre className={`${ui.output} ${className}`}>
      <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}
