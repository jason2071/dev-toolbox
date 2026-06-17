import { useState } from "react";
import type { ToolDef } from "../types";
import { post } from "../../api";
import { ui, badge } from "../../ui";
import { CodeBlock } from "../../components/CodeBlock";

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
    <section className={ui.section}>
      <h1 className={ui.h1}>JWT Decoder</h1>
      <p className={ui.lead}>
        Decode a JWT and compare{" "}
        <code className="rounded bg-slate-200 px-1 font-mono text-[12px] text-slate-700">
          exp
        </code>{" "}
        against now. Signature is not verified.
      </p>

      <div className={`${ui.field} mt-6`}>
        <label htmlFor="jwt-input" className={ui.label}>
          Token
        </label>
        <textarea
          id="jwt-input"
          rows={5}
          className={ui.input}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi…"
        />
      </div>

      <div className={ui.row}>
        <button className={ui.primary} onClick={decode} disabled={busy}>
          {busy ? "Decoding…" : "Decode"}
        </button>
      </div>

      {error && <div className={ui.error}>{error}</div>}

      {res && (
        <>
          {res.expiry && (
            <p className="mb-4 flex items-center gap-2">
              <span className={badge(!res.expiry.expired)}>
                {res.expiry.expired ? "EXPIRED" : "VALID"}
              </span>
              <span className="text-sm text-slate-500">
                {res.expiry.expired ? "expired " : "expires in "}
                {humanLeft(res.expiry.secondsLeft)} ·{" "}
                {new Date(res.expiry.expiresAt).toLocaleString()}
              </span>
            </p>
          )}
          <div className={ui.field}>
            <label className={ui.label}>Header</label>
            <CodeBlock code={JSON.stringify(res.header, null, 2)} lang="json" />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Payload</label>
            <CodeBlock code={JSON.stringify(res.payload, null, 2)} lang="json" />
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
