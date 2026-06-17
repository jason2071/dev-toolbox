import { useEffect, useState } from "react";
import type { ToolDef } from "../types";
import { cachedPost } from "../../api";
import { useIdbState } from "../../hooks/useIdbState";
import { ui } from "../../ui";
import {
  ClipboardPasteIcon,
  IconButton,
  WandIcon,
} from "../../components/icons";
import { CodeBlock } from "../../components/CodeBlock";
import { CopyButton } from "../../components/CopyButton";
import { JsonEditor } from "../../components/JsonEditor";
import { Panel } from "../../components/Panel";

const SAMPLE = `{
  "id": 1,
  "name": "ada",
  "active": true,
  "roles": ["admin", "user"],
  "profile": { "city": "London", "age": 36 }
}`;

// Target languages — value matches the backend, label/hljs drive the UI.
const LANGS = [
  { value: "go", label: "Go", hljs: "go" },
  { value: "typescript", label: "TypeScript", hljs: "typescript" },
  { value: "python", label: "Python", hljs: "python" },
  { value: "rust", label: "Rust", hljs: "rust" },
] as const;

type Lang = (typeof LANGS)[number];

function JsonStructPage() {
  const [input, setInput] = useIdbState("jsonstruct.input", SAMPLE);
  const [rootName, setRootName] = useIdbState("jsonstruct.rootName", "Root");
  const [langValue, setLangValue] = useIdbState("jsonstruct.lang", "go");
  const lang: Lang = LANGS.find((l) => l.value === langValue) ?? LANGS[0];
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function prettify() {
    try {
      setInput(JSON.stringify(JSON.parse(input), null, 2));
    } catch {
      /* invalid JSON — leave as-is */
    }
  }

  async function paste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  // Auto-convert: whenever the input or root name changes and the JSON parses
  // cleanly, convert after a short debounce. Invalid/partial JSON (e.g. while
  // typing) is ignored silently rather than flashing an error.
  useEffect(() => {
    if (input.trim() === "") {
      setCode("");
      setError("");
      return;
    }
    try {
      JSON.parse(input);
    } catch {
      return; // not valid yet — wait
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await cachedPost<{ code: string }>(
          "/api/tools/jsonstruct/convert",
          { json: input, rootName, lang: lang.value },
        );
        if (!cancelled) {
          setCode(res.code);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setCode("");
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [input, rootName, lang]);

  return (
    <section className="flex w-full flex-1 flex-col">
      <h1 className={ui.h1}>JSON → Struct</h1>
      <p className={ui.lead}>
        Convert JSON into type definitions — converts automatically once the
        JSON is valid.
      </p>

      <div className="mt-6 grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
        {/* left: inputs */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="js-root" className={ui.label}>
              Root type name
            </label>
            <input
              id="js-root"
              type="text"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
            />
          </div>

          <Panel
            className="flex-1"
            title=">_ JSON"
            actions={
              <>
                <IconButton label="Prettify" onClick={prettify}>
                  <WandIcon />
                </IconButton>
                <IconButton label="Paste" onClick={paste}>
                  <ClipboardPasteIcon />
                </IconButton>
              </>
            }
          >
            <JsonEditor id="js-input" value={input} onChange={setInput} />
          </Panel>
        </div>

        {/* right: output */}
        <Panel
          className="min-h-0"
          title={
            <select
              id="js-lang"
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={lang.value}
              onChange={(e) => setLangValue(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          }
          actions={code && <CopyButton text={code} />}
        >
          {error ? (
            <div className={`${ui.error} m-3`}>{error}</div>
          ) : code ? (
            <CodeBlock code={code} lang={lang.hljs} light className="h-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Output appears here
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

export const tool: ToolDef = {
  id: "jsonstruct",
  name: "JSON → Struct",
  description: "Convert JSON into Go, TypeScript, Python, or Rust types",
  Page: JsonStructPage,
};
