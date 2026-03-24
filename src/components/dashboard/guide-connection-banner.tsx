"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GuideConnectionBannerProps {
  guideName: string;
}

const DISMISSED_KEY = "guide_connection_banner_dismissed";

export function GuideConnectionBanner({ guideName }: GuideConnectionBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between gap-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">🌙</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-violet-200 leading-snug">
            You&apos;re now connected to {guideName}
          </p>
          <p className="text-xs text-violet-300/60 mt-0.5">
            Your personalized readings will appear in{" "}
            <Link href="/guidance" className="underline underline-offset-2 hover:text-violet-300/90 transition-colors">
              My Guidance
            </Link>
            .
          </p>
        </div>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-violet-300/40 hover:text-violet-300/70 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
