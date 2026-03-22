"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import PostHogProvider from "./posthog-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PostHogProvider>
      {children}
      <Toaster />
    </PostHogProvider>
  );
}
