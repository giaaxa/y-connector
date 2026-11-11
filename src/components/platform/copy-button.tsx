"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
    >
      {done ? <Check className="h-4 w-4 text-sun" /> : <Copy className="h-4 w-4" />} {done ? "Copied" : label}
    </button>
  );
}

export function ShareButton({ text, url }: { text: string; url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (navigator.share) navigator.share({ title: "Join me on Y Connector", text, url }).catch(() => {});
        else window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener");
      }}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold hover:border-ink"
    >
      <Share2 className="h-4 w-4" /> Share
    </button>
  );
}
