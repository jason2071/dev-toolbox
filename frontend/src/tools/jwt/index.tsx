import type { ToolDef } from "../types";

function JwtPage() {
  return (
    <section>
      <h1>JWT Decoder</h1>
      <p className="muted">Decode a JWT and compare exp against now.</p>
      <p className="stub">UI stub — logic ships in Phase 1.</p>
    </section>
  );
}

export const tool: ToolDef = {
  id: "jwt",
  name: "JWT Decoder",
  description: "Decode a JWT and compare exp against now",
  Page: JwtPage,
};
