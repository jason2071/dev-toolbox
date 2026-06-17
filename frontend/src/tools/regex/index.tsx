import type { ToolDef } from "../types";

function RegexPage() {
  return (
    <section>
      <h1>Regex Tester</h1>
      <p className="muted">Test a regex against input and view matches.</p>
      <p className="stub">UI stub — logic ships in Phase 1.</p>
    </section>
  );
}

export const tool: ToolDef = {
  id: "regex",
  name: "Regex Tester",
  description: "Test a regex against input and view matches",
  Page: RegexPage,
};
