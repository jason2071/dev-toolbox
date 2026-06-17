import { useState } from "react";
import type { ToolDef } from "../types";
import { post } from "../../api";

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
      const r = await post<TestResult>("/api/tools/regex/test", {
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
    <section>
      <h1>Regex Tester</h1>
      <p className="muted">
        Test a regex (Go RE2 syntax) against input and view matches.
      </p>

      <div className="field">
        <label htmlFor="re-pattern">Pattern</label>
        <input
          id="re-pattern"
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="re-input">Input</label>
        <textarea
          id="re-input"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
          />
          ignore case (i)
        </label>
        <label>
          <input
            type="checkbox"
            checked={multiline}
            onChange={(e) => setMultiline(e.target.checked)}
          />
          multiline (m)
        </label>
      </div>

      <div className="row">
        <button className="primary" onClick={run} disabled={busy}>
          {busy ? "Testing…" : "Test"}
        </button>
        <button className="secondary" onClick={save}>
          Save pattern
        </button>
      </div>

      {savedPatterns.length > 0 && (
        <div className="field">
          <label>Saved patterns</label>
          <div className="row">
            {savedPatterns.map((p) => (
              <button
                key={p}
                className="chip"
                onClick={() => setPattern(p)}
                title="Load pattern"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {res && (
        <div className="field">
          <label>
            {res.count} match{res.count === 1 ? "" : "es"}
          </label>
          {res.count > 0 && (
            <pre className="output">
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
