"use client";

import { useEffect } from "react";

/** Silently accepts any pending Guide invitation stored in localStorage.
 *  Handles both direct signup and Google OAuth flows.
 *  After accepting, reloads the dashboard so the server-rendered guide card appears. */
export function ClaimGuideTokenOnLoad() {
  useEffect(() => {
    const token = localStorage.getItem("guide_token");
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
  }, []);

  return null;
}
