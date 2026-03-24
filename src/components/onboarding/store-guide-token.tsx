"use client";

import { useEffect } from "react";

/** Re-stores the guide_token into localStorage when it arrives via the email
 *  confirmation redirect URL (cross-device signups lose localStorage). */
export function StoreGuideToken({ token }: { token: string }) {
  useEffect(() => {
    if (token) {
      localStorage.setItem("guide_token", token);
    }
  }, [token]);

  return null;
}
