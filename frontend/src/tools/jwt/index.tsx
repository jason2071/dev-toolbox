import { useEffect, useState } from "react";
import type { ToolDef } from "../types";
import { cachedPost } from "../../api";
import { ui, badge } from "../../ui";
import { CodeBlock } from "../../components/CodeBlock";
import { CopyButton } from "../../components/CopyButton";
import { TokenEditor } from "../../components/TokenEditor";
import { useIdbState } from "../../hooks/useIdbState";

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

// looksLikeJwt is a cheap client-side gate so we only call the backend once the
// token has the three dot-separated segments — avoids decoding while typing.
function looksLikeJwt(token: string): boolean {
  const parts = token.trim().split(".");
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function JwtPage() {
  const [token, setToken] = useIdbState("jwt.token", "");
  const [res, setRes] = useState<DecodeResult | null>(null);
  const [error, setError] = useState("");

  // Auto-decode: when the token has a valid JWT shape, decode after a short
  // debounce. Partial input is ignored silently.
  useEffect(() => {
    if (token.trim() === "") {
      setRes(null);
      setError("");
      return;
    }
    if (!looksLikeJwt(token)) {
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await cachedPost<DecodeResult>("/api/tools/jwt/decode", {
          token,
        });
        if (!cancelled) {
          setRes(r);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setRes(null);
          setError(e instanceof Error ? e.message : String(e));
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [token]);

  return (
    <section className="flex w-full flex-1 flex-col">
      <h1 className={ui.h1}>JWT Decoder</h1>
      <p className={ui.lead}>
        Decode a JWT and compare{" "}
        <code className="rounded bg-slate-200 px-1 font-mono text-[12px] text-slate-700">
          exp
        </code>{" "}
        against now — decodes automatically. Signature is not verified.
      </p>

      <div className="mt-6 grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
        {/* left: token input */}
        <div className={`${ui.field} min-h-0`}>
          <label htmlFor="jwt-input" className={ui.label}>
            Token
          </label>
          <div className="min-h-0 flex-1">
            <TokenEditor id="jwt-input" value={token} onChange={setToken} />
          </div>
        </div>

        {/* right: decoded output */}
        <div className="flex min-h-0 flex-col gap-4">
          {error ? (
            <div className={ui.error}>{error}</div>
          ) : res ? (
            <>
              {res.expiry && (
                <p className="flex flex-wrap items-center gap-2">
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
              <div className={`${ui.field} min-h-0 flex-1`}>
                <div className="flex items-center justify-between">
                  <label className={ui.label}>Header</label>
                  <CopyButton text={JSON.stringify(res.header, null, 2)} />
                </div>
                <CodeBlock
                  code={JSON.stringify(res.header, null, 2)}
                  lang="json"
                  className="min-h-0 flex-1"
                />
              </div>
              <div className={`${ui.field} min-h-0 flex-1`}>
                <div className="flex items-center justify-between">
                  <label className={ui.label}>Payload</label>
                  <CopyButton text={JSON.stringify(res.payload, null, 2)} />
                </div>
                <CodeBlock
                  code={JSON.stringify(res.payload, null, 2)}
                  lang="json"
                  className="min-h-0 flex-1"
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
              Paste a token to decode
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const tool: ToolDef = {
  id: "jwt",
  name: "JWT Decoder",
  description: "Decode a JWT and compare exp against now",
  Page: JwtPage,
};
