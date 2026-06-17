import { useState } from "react";
import type { ToolDef } from "../types";
import { post } from "../../api";

interface Expiry {
  expiresAt: string;
  expired: boolean;
  secondsLeft: number;
}
interface DecodeResult {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  expiry?: Expiry;
}

function humanLeft(s: number): string {
  const abs = Math.abs(s);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const parts = [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${abs % 60}s`].filter(
    Boolean,
  );
  return parts.join(" ");
}

function JwtPage() {
  const [token, setToken] = useState("");
  const [res, setRes] = useState<DecodeResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function decode() {
    setBusy(true);
    setError("");
    try {
      const r = await post<DecodeResult>("/api/tools/jwt/decode", { token });
      setRes(r);
    } catch (e) {
      setRes(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h1>JWT Decoder</h1>
      <p className="muted">
        Decode a JWT and compare <code>exp</code> against now. Signature is not
        verified.
      </p>

      <div className="field">
        <label htmlFor="jwt-input">Token</label>
        <textarea
          id="jwt-input"
          rows={5}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi…"
        />
      </div>

      <div className="row">
        <button className="primary" onClick={decode} disabled={busy}>
          {busy ? "Decoding…" : "Decode"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {res && (
        <>
          {res.expiry && (
            <p>
              <span className={`badge ${res.expiry.expired ? "bad" : "ok"}`}>
                {res.expiry.expired ? "EXPIRED" : "VALID"}
              </span>{" "}
              <span className="muted">
                {res.expiry.expired ? "expired " : "expires in "}
                {humanLeft(res.expiry.secondsLeft)} ·{" "}
                {new Date(res.expiry.expiresAt).toLocaleString()}
              </span>
            </p>
          )}
          <div className="field">
            <label>Header</label>
            <pre className="output">{JSON.stringify(res.header, null, 2)}</pre>
          </div>
          <div className="field">
            <label>Payload</label>
            <pre className="output">{JSON.stringify(res.payload, null, 2)}</pre>
          </div>
        </>
      )}
    </section>
  );
}

export const tool: ToolDef = {
  id: "jwt",
  name: "JWT Decoder",
  description: "Decode a JWT and compare exp against now",
  Page: JwtPage,
};
