import { useState } from "react";
import type { ToolDef } from "../types";
import { cachedPost } from "../../api";
import { ui } from "../../ui";

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

// In-memory store for saved patterns — survives sidebar navigation within the
// session (no persistence, per Phase 1 scope).
const savedPatterns: string[] = [];

function RegexPage() {
  const [pattern, setPattern] = useState(String.raw`(?P<word>\w+)`);
  const [input, setInput] = useState("hello world 42");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const [res, setRes] = useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [, force] = useState(0); // re-render after mutating savedPatterns

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
      savedPatterns.push(pattern);
      force((n) => n + 1);
    }
  }

  return (
    <section className={ui.section}>
      <h1 className={ui.h1}>Regex Tester</h1>
      <p className={ui.lead}>
        Test a regex (Go RE2 syntax) against input and view matches.
      </p>

      <div className={`${ui.field} mt-6`}>
        <label htmlFor="re-pattern" className={ui.label}>
          Pattern
        </label>
        <input
          id="re-pattern"
          type="text"
          className={ui.input}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
        />
      </div>

      <div className={ui.field}>
        <label htmlFor="re-input" className={ui.label}>
          Input
        </label>
        <textarea
          id="re-input"
          rows={5}
          className={ui.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

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
      </div>

      <div className={ui.row}>
        <button className={ui.primary} onClick={run} disabled={busy}>
          {busy ? "Testing…" : "Test"}
        </button>
        <button className={ui.secondary} onClick={save}>
          Save pattern
        </button>
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
        <div className={ui.field}>
          <label className={ui.label}>
            {res.count} match{res.count === 1 ? "" : "es"}
          </label>
          {res.count > 0 && (
            <pre className={ui.output}>
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
          )}
        </div>
      )}
    </section>
  );
}

export const tool: ToolDef = {
  id: "regex",
  name: "Regex Tester",
  description: "Test a regex against input and view matches",
  Page: RegexPage,
};
