import type { ToolDef } from "../types";

function JsonStructPage() {
  return (
    <section>
      <h1>JSON → Go Struct</h1>
      <p className="muted">Convert JSON into Go struct definitions.</p>
      <p className="stub">UI stub — logic ships in Phase 1.</p>
    </section>
  );
}

export const tool: ToolDef = {
  id: "jsonstruct",
  name: "JSON → Go Struct",
  description: "Convert JSON into Go struct definitions",
  Page: JsonStructPage,
};
