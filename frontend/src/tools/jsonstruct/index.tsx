import { useState } from "react";
import type { ToolDef } from "../types";
import { post } from "../../api";

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
    <section>
      <h1>JSON → Go Struct</h1>
      <p className="muted">Convert JSON into Go struct definitions.</p>

      <div className="field">
        <label htmlFor="js-root">Root type name</label>
        <input
          id="js-root"
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="js-input">JSON</label>
        <textarea
          id="js-input"
          rows={12}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="row">
        <button className="primary" onClick={convert} disabled={busy}>
          {busy ? "Converting…" : "Convert"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {code && <pre className="output">{code}</pre>}
    </section>
  );
}

export const tool: ToolDef = {
  id: "jsonstruct",
  name: "JSON → Go Struct",
  description: "Convert JSON into Go struct definitions",
  Page: JsonStructPage,
};
