"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";

interface Question {
  id: string;
  question: string;
  area: string;
}

interface Answer {
  id: string;
  question: string;
  answer: string;
}

type Phase =
  | "intro"
  | "generating"
  | "quiz"
  | "reviewing"
  | "analyzing"
  | "reveal"
  | "saved";

const AREA_LABELS: Record<string, string> = {
  attachment: "Attachment",
  "self-worth": "Self-Worth",
  conflict: "Conflict",
  identity: "Identity",
  desire: "Desire",
  boundaries: "Boundaries",
  "self-deception": "Self-Awareness",
  grief: "Grief",
  ambition: "Ambition",
  intimacy: "Intimacy",
};

function PortraitDisplay({ text }: { text: string }) {
  const sections = text.split(/\n(?=\*\*[🔍⚡🌑🪞✦])/);
  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        const lines = section.split("\n");
        const header = lines[0]?.replace(/^\*\*|\*\*$/g, "").trim();
        const body = lines.slice(1).join("\n").trim();
        if (!header || !body) {
          return (
            <p key={i} className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {section}
            </p>
          );
        }
        const isLastSection = header.startsWith("✦");
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`space-y-2 ${isLastSection ? "pt-4 border-t border-white/[0.06]" : ""}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-widest ${isLastSection ? "text-gold/90" : "text-gold/60"}`}>
              {header}
            </p>
            <p className={`leading-relaxed whitespace-pre-wrap ${isLastSection ? "text-sm text-foreground font-medium" : "text-sm text-foreground/80"}`}>
              {body}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

export function InsightQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [portrait, setPortrait] = useState("");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleGamificationResult } = useGamification();

  // Auto-focus textarea when question changes
  useEffect(() => {
    if (phase === "quiz") {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [currentQ, phase]);

  async function generate() {
    setPhase("generating");
    setError("");
    try {
      const res = await fetch("/api/insight-quiz/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate questions.");
        setPhase("intro");
        return;
      }
      setQuestions(data.questions);
      setSessionId(data.sessionId);
      setCurrentQ(0);
      setAnswers([]);
      setCurrentAnswer("");
      setPhase("quiz");
    } catch {
      setError("Connection error. Please try again.");
      setPhase("intro");
    }
  }

  function submitAnswer() {
    if (!currentAnswer.trim()) return;
    const q = questions[currentQ];
    const newAnswers = [
      ...answers,
      { id: q.id, question: q.question, answer: currentAnswer.trim() },
    ];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase("reviewing");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitAnswer();
    }
  }

  async function submitAll() {
    if (!sessionId) return;
    setPhase("analyzing");
    setPortrait("");

    try {
      const res = await fetch("/api/insight-quiz/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Analysis failed.");
        setPhase("reviewing");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new globalThis.TextDecoder();
      if (!reader) return;

      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setPortrait(text);
      }

      setPhase("reveal");

      const xpRes = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile_setup" }),
      });
      if (xpRes.ok) {
        const data = await xpRes.json();
        handleGamificationResult(data);
      }
    } catch {
      setError("Connection error during analysis.");
      setPhase("reviewing");
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      const prev = answers[currentQ - 1];
      setCurrentAnswer(prev?.answer ?? "");
      const newAnswers = answers.slice(0, currentQ - 1);
      setAnswers(newAnswers);
    }
  }

  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header — only show on non-immersive phases */}
      {(phase === "intro" || phase === "generating") && (
        <div className="space-y-1">
          <h1 className="font-serif text-display-sm text-foreground">Insight Session</h1>
          <p className="text-sm text-muted-foreground">
            The AI has read your full profile. It has questions.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── Intro ─────────────────────────────────────────────────────── */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            {error && (
              <div className="text-sm text-red-400/80 bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="glass-card p-8 space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl"
                >
                  🪞
                </motion.div>
                <h2 className="font-serif text-lg text-foreground/90">
                  This is not a generic quiz.
                </h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-md mx-auto">
                  The AI will generate 5 questions specifically for you — drawn from your chart,
                  your archetype, your psychological profile, and everything you&apos;ve shared in
                  the app so far.
                </p>
                <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
                  Answer honestly. There are no right answers. The more you share, the more
                  accurate the portrait.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: "🔮", label: "Chart-aware" },
                  { icon: "🧠", label: "Trait-targeted" },
                  { icon: "✦", label: "Unique to you" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <p className="text-xl mb-1">{icon}</p>
                    <p className="text-xs text-muted-foreground/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generate}
              className="w-full py-4 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
            >
              Begin my insight session ✦
            </button>
          </motion.div>
        )}

        {/* ── Generating ────────────────────────────────────────────────── */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 text-center space-y-5"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-4xl inline-block"
            >
              ⚖
            </motion.div>
            <div className="space-y-1.5">
              <p className="text-sm text-foreground/70">Reading your full profile…</p>
              <p className="text-xs text-muted-foreground/40">
                Calibrating questions to your specific psychology
              </p>
            </div>
            <motion.div
              className="flex justify-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-gold/40 inline-block"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ── Quiz ─────────────────────────────────────────────────────── */}
        {phase === "quiz" && questions[currentQ] && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="space-y-5"
          >
            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${
                    i < currentQ
                      ? "bg-gold/60"
                      : i === currentQ
                      ? "bg-gold/30"
                      : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gold/40 uppercase tracking-widest">
                {AREA_LABELS[questions[currentQ].area] ?? questions[currentQ].area}
              </p>
              <p className="font-serif text-xl text-foreground/90 leading-relaxed">
                {questions[currentQ].question}
              </p>
            </div>

            <div className="glass-card p-4">
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Take your time. Answer honestly."
                rows={6}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 resize-none outline-none leading-relaxed"
              />
              <p className="text-xs text-muted-foreground/25 mt-2">⌘ + Enter to continue</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentQ === 0}
                className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors disabled:opacity-20"
              >
                ← Previous
              </button>
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim()}
                className="px-6 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {currentQ < questions.length - 1 ? "Next question →" : "Complete session →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Reviewing (pre-submit confirmation) ──────────────────────── */}
        {phase === "reviewing" && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            {error && (
              <div className="text-sm text-red-400/80 bg-red-400/5 border border-red-400/10 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="glass-card p-6 space-y-4">
              <p className="text-xs text-gold/50 uppercase tracking-widest">
                Your session — {answers.length} questions answered
              </p>
              <div className="space-y-3">
                {answers.map((a, i) => (
                  <div key={i} className="space-y-1 pb-3 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <p className="text-xs text-muted-foreground/50 leading-snug">{a.question}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                      {a.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={submitAll}
              className="w-full py-4 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all"
            >
              Analyze my responses ✦
            </button>

            <button
              onClick={() => {
                setPhase("quiz");
                setCurrentQ(answers.length - 1);
                setCurrentAnswer(answers[answers.length - 1]?.answer ?? "");
                setAnswers(answers.slice(0, answers.length - 1));
              }}
              className="w-full py-2.5 text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
            >
              Go back and edit
            </button>
          </motion.div>
        )}

        {/* ── Analyzing ────────────────────────────────────────────────── */}
        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {portrait ? (
              <div className="glass-card p-6">
                <PortraitDisplay text={portrait} />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-gold/60 ml-1 align-middle"
                />
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-4xl"
                >
                  🪞
                </motion.div>
                <p className="text-sm text-muted-foreground/50">
                  Reading your responses…
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Reveal ───────────────────────────────────────────────────── */}
        {phase === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🪞</span>
              <div>
                <h1 className="font-serif text-display-sm text-foreground">Your Portrait</h1>
                <p className="text-xs text-muted-foreground/50">
                  Based on your responses and your full profile
                </p>
              </div>
            </div>

            <div className="glass-card p-6">
              <PortraitDisplay text={portrait} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 border-gold/10 space-y-1"
            >
              <p className="text-xs text-gold/60 uppercase tracking-widest">What just happened</p>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                Your insights have been added to your memory. Every future reading, companion
                conversation, and decoder result will now reflect what you revealed here.
              </p>
            </motion.div>

            <button
              onClick={generate}
              className="w-full py-3 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
            >
              Start a new session
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator during quiz */}
      {phase === "quiz" && (
        <p className="text-center text-xs text-muted-foreground/30">
          {currentQ + 1} of {questions.length}
        </p>
      )}
    </div>
  );
}
