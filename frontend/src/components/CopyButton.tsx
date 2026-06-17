import { useState } from "react";
import { CheckIcon, CopyIcon, IconButton } from "./icons";

// CopyButton copies the given text to the clipboard and briefly flips its icon
// to a check. Self-contained so any output panel can drop one in.
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <IconButton label={copied ? "Copied!" : "Copy"} onClick={copy}>
      {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
    </IconButton>
  );
}
