"use client";

import { useEffect } from "react";

/** Silently accepts any pending Guide invitation stored in localStorage.
 *  Handles both direct signup and Google OAuth flows. */
export function ClaimGuideTokenOnLoad() {
  useEffect(() => {
    const token = localStorage.getItem("guide_token");
    if (!token) return;

    fetch("/api/guide/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(() => localStorage.removeItem("guide_token"))
      .catch(() => {});
  }, []);

  return null;
}
