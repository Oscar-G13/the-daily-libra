"use client";

import { useEffect } from "react";
import { CosmicBackground } from "@/components/ui/cosmic-background";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <CosmicBackground />
      <div className="relative z-10 text-center space-y-6 max-w-sm">
        <p className="text-4xl">✦</p>
        <h1 className="font-serif text-2xl text-foreground">Something went wrong.</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. This has been noted and will be fixed. Probably.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-6 py-2.5 rounded-full border border-white/10 text-foreground text-sm hover:border-gold/30 transition-colors"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
