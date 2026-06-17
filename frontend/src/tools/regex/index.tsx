import { useState } from "react";
import type { ToolDef } from "../types";
import { cachedPost } from "../../api";
import { ui } from "../../ui";
import { Panel } from "../../components/Panel";
import { CopyButton } from "../../components/CopyButton";
import { useIdbState } from "../../hooks/useIdbState";

interface Group {
  index: number;
  name?: string;
  text: string;
  matched: boolean;
}
interface Match {
  text: string;
  start: number;
  end: number;
  groups: Group[];
}
interface TestResult {
  matches: Match[];
  count: number;
}

function RegexPage() {
  const [pattern, setPattern] = useIdbState(
    "regex.pattern",
    String.raw`(?P<word>\w+)`,
  );
  const [input, setInput] = useIdbState("regex.input", "hello world 42");
  const [ignoreCase, setIgnoreCase] = useIdbState("regex.ignoreCase", false);
  const [multiline, setMultiline] = useIdbState("regex.multiline", false);
  const [savedPatterns, setSavedPatterns] = useIdbState<string[]>(
    "regex.saved",
    [],
  );
  const [res, setRes] = useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError("");
    try {
      const r = await cachedPost<TestResult>("/api/tools/regex/test", {
        pattern,
        input,
        ignoreCase,
        multiline,
      });
      setRes(r);
    } catch (e) {
      setRes(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (pattern && !savedPatterns.includes(pattern)) {
      setSavedPatterns([...savedPatterns, pattern]);
    }
  }

  const fieldInput =
    "w-full bg-white px-3.5 py-2.5 font-mono text-sm text-slate-800 focus:outline-none";

  return (
    <section className="w-full max-w-4xl">
      <h1 className={ui.h1}>Regex Tester</h1>
      <p className={ui.lead}>
        Test a regex (Go RE2 syntax) against input and view matches.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <Panel
          focusable
          title=">_ Pattern"
          actions={pattern && <CopyButton text={pattern} />}
        >
          <input
            id="re-pattern"
            type="text"
            className={fieldInput}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
          />
        </Panel>

        <Panel focusable title="Input">
          <textarea
            id="re-input"
            rows={5}
            className={`${fieldInput} resize-y`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>

        <div className={ui.row}>
          <label className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <input
              type="checkbox"
              className="h-4 w-4 accent-indigo-500"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
            />
            ignore case (i)
          </label>
          <label className="inline-flex items-center gap-1.5 text-sm text-slate-500">
            <input
              type="checkbox"
              className="h-4 w-4 accent-indigo-500"
              checked={multiline}
              onChange={(e) => setMultiline(e.target.checked)}
            />
            multiline (m)
          </label>
          <div className="ml-auto flex gap-2">
            <button className={ui.secondary} onClick={save}>
              Save pattern
            </button>
            <button className={ui.primary} onClick={run} disabled={busy}>
              {busy ? "Testing…" : "Test"}
            </button>
          </div>
        </div>

        {savedPatterns.length > 0 && (
          <div className={ui.field}>
            <label className={ui.label}>Saved patterns</label>
            <div className="flex flex-wrap gap-2">
              {savedPatterns.map((p) => (
                <button
                  key={p}
                  className={ui.chip}
                  onClick={() => setPattern(p)}
                  title="Load pattern"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className={ui.error}>{error}</div>}

        {res && (
          <Panel
            pill={`${res.count} match${res.count === 1 ? "" : "es"}`}
            title="Matches"
          >
            {res.count > 0 ? (
              <pre className="overflow-auto p-4 font-mono text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
                {res.matches
                  .map((m, i) => {
                    const head = `#${i + 1}  [${m.start}-${m.end}]  ${m.text}`;
                    const groups = m.groups
                      .map(
                        (g) =>
                          `    group ${g.index}${g.name ? ` (${g.name})` : ""}: ${
                            g.matched ? g.text : "<no match>"
                          }`,
                      )
                      .join("\n");
                    return groups ? `${head}\n${groups}` : head;
                  })
                  .join("\n\n")}
              </pre>
            ) : (
              <p className="p-4 text-sm text-slate-400">No matches.</p>
            )}
          </Panel>
        )}
      </div>
    </section>
  );
}

export const tool: ToolDef = {
  id: "regex",
  name: "Regex Tester",
  description: "Test a regex against input and view matches",
  Page: RegexPage,
};
