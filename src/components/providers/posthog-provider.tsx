"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, ReactNode } from "react";

export default function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
        capture_pageview: false, // handled manually
        persistence: "localStorage",
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
