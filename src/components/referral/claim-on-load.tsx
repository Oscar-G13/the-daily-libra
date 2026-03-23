"use client";

import { useEffect } from "react";

/** Silently claims any pending referral code stored in localStorage.
 *  Handles the Google OAuth flow where we can't claim server-side. */
export function ClaimReferralOnLoad() {
  useEffect(() => {
    const code = localStorage.getItem("ref_code");
    if (!code) return;

    fetch("/api/referral/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(() => localStorage.removeItem("ref_code"))
      .catch(() => {});
  }, []);

  return null;
}
