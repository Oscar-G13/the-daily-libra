"use client";

import { useState } from "react";

export function ShareProfileButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/s/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="text-xs text-muted-foreground/30 hover:text-gold/50 transition-colors mt-1 inline-block"
    >
      {copied ? "Link copied ✓" : "Copy share link ✦"}
    </button>
  );
}
