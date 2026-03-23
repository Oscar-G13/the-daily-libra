"use client";

import { AestheticQuiz } from "./aesthetic-quiz";
import type { AestheticStyle } from "@/types";

export function AestheticQuizClient({ existingStyle }: { existingStyle: AestheticStyle | null }) {
  return <AestheticQuiz existingStyle={existingStyle} />;
}
