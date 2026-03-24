"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ClaimGuideTokenInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Also accept tokens forwarded via URL (cross-device email confirmation path)
    const urlToken = searchParams.get("guide_token");
    if (urlToken) {
      localStorage.setItem("guide_token", urlToken);
      // Clean the URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("guide_token");
      window.history.replaceState({}, "", url.toString());
    }

    const token = urlToken || localStorage.getItem("guide_token");
    if (!token) return;

    fetch("/api/guide/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        localStorage.removeItem("guide_token");
        if (res.ok) {
          const data = await res.json();
          if (!data.already_accepted) {
            // Force server re-render so the guide card appears immediately
            window.location.href = "/dashboard?guide_connected=1";
          }
        }
      })
      .catch(() => {
        localStorage.removeItem("guide_token");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** Silently accepts any pending Guide invitation stored in localStorage or URL.
 *  Handles direct signup, Google OAuth, and cross-device email confirmation flows. */
export function ClaimGuideTokenOnLoad() {
  return (
    <Suspense fallback={null}>
      <ClaimGuideTokenInner />
    </Suspense>
  );
}
