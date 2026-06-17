import { useEffect, useState } from "react";
import type { ToolDef } from "../types";
import { cachedPost } from "../../api";
import { ui } from "../../ui";
import { CodeBlock } from "../../components/CodeBlock";
import { CopyButton } from "../../components/CopyButton";
import { TokenEditor } from "../../components/TokenEditor";
import { ClearIcon, IconButton } from "../../components/icons";
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
        {/* left: token input card */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500/30">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <span className="font-mono text-sm font-medium text-slate-600">
              &gt;_ JSON Web Token (JWT)
            </span>
            {token && (
              <div className="flex gap-1.5">
                <CopyButton text={token} />
                <IconButton label="Clear" onClick={() => setToken("")}>
                  <ClearIcon />
                </IconButton>
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1">
            <TokenEditor id="jwt-input" value={token} onChange={setToken} />
          </div>
          {error ? (
            <div className="border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-red-600">
              ✗ {error}
            </div>
          ) : res?.expiry ? (
            <div className="border-t border-slate-100 px-3 py-2.5 text-sm">
              <span
                className={
                  res.expiry.expired
                    ? "font-medium text-red-600"
                    : "font-medium text-emerald-600"
                }
              >
                {res.expiry.expired ? "✗ Expired JWT" : "✓ Valid JWT"}
              </span>
              <span className="ml-2 text-slate-500">
                {res.expiry.expired ? "expired " : "expires in "}
                {humanLeft(res.expiry.secondsLeft)} ·{" "}
                {new Date(res.expiry.expiresAt).toLocaleString()}
              </span>
            </div>
          ) : res ? (
            <div className="border-t border-slate-100 px-3 py-2.5 text-sm font-medium text-emerald-600">
              ✓ Valid JWT
            </div>
          ) : null}
        </div>

        {/* right: decoded output */}
        <div className="flex min-h-0 flex-col gap-4 overflow-auto">
          {res ? (
            <>
              <ClaimsCard title="Decoded Header" data={res.header} />
              <ClaimsCard title="Decoded Payload" data={res.payload} />
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

// ClaimsCard is a white panel with a "JSON" pill header, a copy button, and the
// highlighted claims.
function ClaimsCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-600">{title}</div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            JSON
          </span>
          <CopyButton text={json} />
        </div>
        <CodeBlock code={json} lang="json" light />
      </div>
    </div>
  );
}

export const tool: ToolDef = {
  id: "jwt",
  name: "JWT Decoder",
  description: "Decode a JWT and compare exp against now",
  Page: JwtPage,
};
