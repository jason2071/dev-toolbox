import { useState } from "react";
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
  const [busy, setBusy] = useState(false);

  async function convert() {
    setBusy(true);
    setError("");
    try {
      const res = await post<{ code: string }>(
        "/api/tools/jsonstruct/convert",
        { json: input, rootName },
      );
      setCode(res.code);
    } catch (e) {
      setCode("");
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={ui.section}>
      <h1 className={ui.h1}>JSON → Go Struct</h1>
      <p className={ui.lead}>Convert JSON into Go struct definitions.</p>

      <div className={`${ui.field} mt-6`}>
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

      <div className={ui.field}>
        <label htmlFor="js-input" className={ui.label}>
          JSON
        </label>
        <textarea
          id="js-input"
          rows={12}
          className={ui.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className={ui.row}>
        <button className={ui.primary} onClick={convert} disabled={busy}>
          {busy ? "Converting…" : "Convert"}
        </button>
      </div>

      {error && <div className={ui.error}>{error}</div>}
      {code && <pre className={ui.output}>{code}</pre>}
    </section>
  );
}

export const tool: ToolDef = {
  id: "jsonstruct",
  name: "JSON → Go Struct",
  description: "Convert JSON into Go struct definitions",
  Page: JsonStructPage,
};
