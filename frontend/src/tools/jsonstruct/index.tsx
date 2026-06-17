import { useEffect, useState } from "react";
import type { ToolDef } from "../types";
import { post } from "../../api";
import { ui } from "../../ui";

const SAMPLE = `{
  "id": 1,
  "name": "ada",
  "active": true,
  "roles": ["admin", "user"],
  "profile": { "city": "London", "age": 36 }
}`;

function JsonStructPage() {
  const [input, setInput] = useState(SAMPLE);
  const [rootName, setRootName] = useState("Root");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

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
        const res = await post<{ code: string }>(
          "/api/tools/jsonstruct/convert",
          { json: input, rootName },
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
  }, [input, rootName]);

  return (
    <section className="w-full">
      <h1 className={ui.h1}>JSON → Go Struct</h1>
      <p className={ui.lead}>
        Convert JSON into Go struct definitions — converts automatically once
        the JSON is valid.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* left: inputs */}
        <div className="flex flex-col">
          <div className={ui.field}>
            <label htmlFor="js-root" className={ui.label}>
              Root type name
            </label>
            <input
              id="js-root"
              type="text"
              className={ui.input}
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
            />
          </div>

          <div className={`${ui.field} flex-1`}>
            <label htmlFor="js-input" className={ui.label}>
              JSON
            </label>
            <textarea
              id="js-input"
              className={`${ui.input} min-h-[420px] flex-1`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        {/* right: output */}
        <div className={ui.field}>
          <label className={ui.label}>Go struct</label>
          {error ? (
            <div className={ui.error}>{error}</div>
          ) : code ? (
            <pre className={`${ui.output} min-h-[420px]`}>{code}</pre>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
              Output appears here
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const tool: ToolDef = {
  id: "jsonstruct",
  name: "JSON → Go Struct",
  description: "Convert JSON into Go struct definitions",
  Page: JsonStructPage,
};
