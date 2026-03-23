"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { QuestionCard } from "./question-card";
import { SectionIntro } from "./section-intro";
import { AssessmentProgress } from "./assessment-progress";
import { ResumePrompt } from "./resume-prompt";
import { RevealCeremony } from "./reveal-ceremony";
import type {
  AssessmentSection,
  AssessmentSession,
  AnswerSubmission,
  ProfileSummary,
  TraitScore,
} from "@/types/assessment";

type Phase =
  | "loading"
  | "intro"
  | "resume-prompt"
  | "section-intro"
  | "question"
  | "calculating"
  | "reveal";

export function AssessmentShell() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sections, setSections] = useState<AssessmentSection[]>([]);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [versionId, setVersionId] = useState<string>("");

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});

  const [traitScores, setTraitScores] = useState<Record<string, TraitScore>>({});
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Flat list of all questions for progress counting
  const allQuestions = sections.flatMap((s) => s.assessment_questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.assessment_questions[currentQuestionIndex];

  // Load session + question bank on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/assessment/session");
        const data = await res.json();
        setSections(data.sections ?? []);
        setVersionId(data.version_id ?? "");

        if (data.session) {
          setSession(data.session);
          setPhase("resume-prompt");
        } else {
          setPhase("intro");
        }
      } catch {
        setError("Failed to load assessment. Please refresh.");
      }
    }
    load();
  }, []);

  async function createSession() {
    const res = await fetch("/api/assessment/session", { method: "POST" });
    const data = await res.json();
    setSession(data.session);
  }

  function handleBegin() {
    createSession();
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setPhase("section-intro");
  }

  function handleResume() {
    if (!session) return;
    // Find where we left off by matching current_question_id
    const lastQuestionId = session.current_question_id;
    if (lastQuestionId) {
      for (let si = 0; si < sections.length; si++) {
        const qi = sections[si].assessment_questions.findIndex((q) => q.id === lastQuestionId);
        if (qi !== -1) {
          setCurrentSectionIndex(si);
          setCurrentQuestionIndex(qi + 1 < sections[si].assessment_questions.length ? qi + 1 : 0);
          setPhase("question");
          return;
        }
      }
    }
    setPhase("question");
  }

  function handleStartFresh() {
    // Abandon old session — fire and forget
    if (session) {
      fetch("/api/assessment/session", { method: "POST" }).then((r) =>
        r.json().then((d) => setSession(d.session))
      );
    } else {
      createSession();
    }
    setAnswers({});
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setPhase("section-intro");
  }

  const autosave = useCallback(
    (submission: AnswerSubmission, newAnsweredCount: number) => {
      if (!session?.id) return;
      // Fire and forget — never block the UI
      fetch("/api/assessment/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          question_id: submission.question_id,
          selected_option_id: submission.selected_option_id,
          numeric_response: submission.numeric_response,
          rank_response: submission.rank_response,
          total_questions: totalQuestions,
          answered_count: newAnsweredCount,
        }),
      }).catch(() => {
        // Autosave failure is silent — don't block the user
      });
    },
    [session?.id, totalQuestions]
  );

  function advance() {
    const section = sections[currentSectionIndex];
    const nextQi = currentQuestionIndex + 1;

    if (nextQi < section.assessment_questions.length) {
      setCurrentQuestionIndex(nextQi);
    } else {
      const nextSi = currentSectionIndex + 1;
      if (nextSi < sections.length) {
        setCurrentSectionIndex(nextSi);
        setCurrentQuestionIndex(0);
        setPhase("section-intro");
      } else {
        // Done
        handleComplete();
      }
    }
  }

  function handleAnswer(submission: AnswerSubmission) {
    const newAnswers = { ...answers, [submission.question_id]: submission };
    setAnswers(newAnswers);
    const newAnsweredCount = Object.keys(newAnswers).length;
    autosave(submission, newAnsweredCount);
    advance();
  }

  async function handleComplete() {
    setPhase("calculating");
    try {
      if (!session?.id) throw new Error("No session");

      // Score
      const scoreRes = await fetch("/api/assessment/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
      const scoreData = await scoreRes.json();
      if (!scoreRes.ok) throw new Error(scoreData.error);
      setTraitScores(scoreData.trait_scores);

      // Generate profile
      const profileRes = await fetch("/api/assessment/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, version_id: versionId }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error);
      setProfileSummary(profileData.profile);

      setPhase("reveal");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong during profile generation"
      );
      setPhase("question"); // allow retry
    }
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border border-gold/30 border-t-gold/80 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Preparing your assessment…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md text-center space-y-4">
          <p className="text-sm text-red-300/80">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-gold/60 hover:text-gold transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (phase === "resume-prompt" && session) {
    return (
      <ResumePrompt session={session} onResume={handleResume} onStartFresh={handleStartFresh} />
    );
  }

  if (phase === "intro") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 sm:p-12 max-w-md text-center space-y-6">
          <p className="text-gold/60 text-xs uppercase tracking-widest">Deep Profile</p>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
            Know yourself, finally.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            130 questions. 24 dimensions. One portrait — precise enough to actually mean something.
            <br />
            <br />
            Takes about 15 minutes. You can pause and come back.
          </p>
          <button
            onClick={handleBegin}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (phase === "section-intro" && currentSection) {
    return (
      <SectionIntro
        section={currentSection}
        sectionNumber={currentSectionIndex + 1}
        totalSections={sections.length}
        onContinue={() => setPhase("question")}
      />
    );
  }

  if (phase === "calculating") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-gold/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-gold/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-gold/10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg text-foreground">Mapping your portrait…</p>
            <p className="text-xs text-muted-foreground">
              Scoring 24 dimensions · generating your profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "reveal" && profileSummary) {
    return <RevealCeremony profile={profileSummary} traitScores={traitScores} />;
  }

  if (phase === "question" && currentQuestion && currentSection) {
    const globalIndex =
      sections
        .slice(0, currentSectionIndex)
        .reduce((acc, s) => acc + s.assessment_questions.length, 0) + currentQuestionIndex;

    return (
      <div className="min-h-screen flex flex-col">
        <AssessmentProgress
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          currentSectionName={currentSection.title}
          currentSectionIndex={currentSectionIndex}
          totalSections={sections.length}
        />
        <div className="flex-1 flex items-center justify-center px-4 py-8 pt-20">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={globalIndex + 1}
              totalQuestions={totalQuestions}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return null;
}
