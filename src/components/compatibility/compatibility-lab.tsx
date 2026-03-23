"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/components/gamification/provider";
import { ShareToFeed } from "@/components/feed/share-to-feed";

const RELATIONSHIP_TYPES = [
  { value: "romantic", label: "Romantic Partner", icon: "🌹" },
  { value: "crush", label: "Crush", icon: "💫" },
  { value: "ex", label: "Ex", icon: "🌑" },
  { value: "friendship", label: "Close Friend", icon: "✨" },
  { value: "coworker", label: "Coworker", icon: "⚡" },
  { value: "family", label: "Family", icon: "🌿" },
] as const;

const SECTION_ICONS = ["✦", "💬", "🌙", "⚡", "🌹", "⚠", "⚖"];

function HeartScalesIcon() {
  return (
    <svg width="32" height="28" viewBox="0 0 32 28" className="text-gold">
      <line x1="16" y1="3" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="4" y1="9" x2="28" y2="9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="7" y1="9" x2="7" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse
        cx="7"
        cy="18"
        rx="4"
        ry="1.5"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <line x1="25" y1="9" x2="25" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <ellipse
        cx="25"
        cy="18"
        rx="4"
        ry="1.5"
        fill="currentColor"
        opacity="0.15"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <circle cx="16" cy="3" r="1.5" fill="currentColor" opacity="0.5" />
      <path
        d="M14 5.5 C14 4.1 15 3.5 16 4.5 C17 3.5 18 4.1 18 5.5 C18 6.9 16 8 16 8 C16 8 14 6.9 14 5.5Z"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

function ReadingDisplay({ text }: { text: string }) {
  const sections = text.split(/\n(?=\*\*[✦💬🌙⚡🌹⚠⚖])/);

  return (
    <div className="space-y-5">
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

        const isScore = body.match(/\d+\/10/);

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-gold/80 uppercase tracking-widest">
                {header}
              </p>
              {isScore && (
                <span className="text-xs text-gold/50 font-mono">
                  {body.match(/(\d+)\/10/)?.[0]}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

interface PastReport {
  id: string;
  partner_name: string;
  relationship_type: string;
  partner_birth_data_json: { chart?: { sun?: string; moon?: string } };
  report_json: { text: string };
  created_at: string;
}

export function CompatibilityLab({ isPremium }: { isPremium: boolean }) {
  const [step, setStep] = useState<"form" | "loading" | "result" | "history">("form");
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirthDate, setPartnerBirthDate] = useState("");
  const [partnerBirthTime, setPartnerBirthTime] = useState("");
  const [relationshipType, setRelationshipType] = useState<string>("romantic");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PastReport | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { handleGamificationResult } = useGamification();

  const isFormValid = partnerName.trim().length >= 2 && partnerBirthDate;

  async function submitCompatibility() {
    if (!isFormValid) return;
    setStep("loading");
    setResponse("");
    setError("");

    try {
      const res = await fetch("/api/ai/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName,
          partnerBirthDate,
          partnerBirthTime: partnerBirthTime || undefined,
          relationshipType,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Something went wrong.");
        setStep("form");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        text += chunk;
        setResponse(text);
      }

      setStep("result");

      const xpRes = await fetch("/api/gamification/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reading" }),
      });
      if (xpRes.ok) {
        const data = await xpRes.json();
        handleGamificationResult(data);
      }
    } catch {
      setError("Connection error. Please try again.");
      setStep("form");
    }
  }

  async function loadHistory() {
    if (historyLoaded) {
      setStep("history");
      return;
    }
    try {
      const res = await fetch("/api/ai/compatibility?limit=20");
      if (res.ok) {
        const data = await res.json();
        setPastReports(data.reports ?? []);
        setHistoryLoaded(true);
      }
    } catch {
      // silently fail
    }
    setStep("history");
  }

  function reset() {
    setStep("form");
    setResponse("");
    setError("");
    setPartnerName("");
    setPartnerBirthDate("");
    setPartnerBirthTime("");
    setRelationshipType("romantic");
    setSelectedReport(null);
    setHistoryLoaded(false);
  }

  const selectedType = RELATIONSHIP_TYPES.find((r) => r.value === relationshipType);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartScalesIcon />
            <div>
              <h1 className="font-serif text-display-sm text-foreground">Compatibility Lab</h1>
              <p className="text-sm text-muted-foreground">
                Chart-based relationship readings — for every dynamic in your orbit
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                {isPremium
                  ? "Unlimited compatibility readings are active on your paid plan."
                  : "Free tier includes 1 compatibility reading every 7 days."}
              </p>
            </div>
          </div>
          {(step === "result" || step === "form") && (
            <button
              onClick={loadHistory}
              className="text-xs text-muted-foreground/60 hover:text-gold/70 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.04] hover:border-gold/15"
            >
              Past readings
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Form */}
        {step === "form" && (
          <motion.div
            key="form"
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

            {/* Partner info */}
            <div className="glass-card p-5 space-y-5">
              <p className="text-xs text-gold/50 uppercase tracking-widest">Who are we reading?</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Their name</label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="First name or nickname"
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-gold/20 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Birth date</label>
                    <input
                      type="date"
                      value={partnerBirthDate}
                      onChange={(e) => setPartnerBirthDate(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">
                      Birth time <span className="text-muted-foreground/40">(optional)</span>
                    </label>
                    <input
                      type="time"
                      value={partnerBirthTime}
                      onChange={(e) => setPartnerBirthTime(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold/20 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Relationship type */}
            <div className="glass-card p-5 space-y-4">
              <p className="text-xs text-gold/50 uppercase tracking-widest">Relationship type</p>
              <div className="grid grid-cols-3 gap-2">
                {RELATIONSHIP_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setRelationshipType(type.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                      relationshipType === type.value
                        ? "bg-gold/[0.08] border-gold/25 text-gold-200"
                        : "bg-white/[0.02] border-white/[0.05] text-muted-foreground hover:border-gold/15 hover:text-foreground"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-xs font-medium leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={submitCompatibility}
              disabled={!isFormValid}
              className="w-full py-3.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Read the Stars ✦
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Partner recap */}
            <div className="glass-card p-4 border-gold/10">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Reading for</p>
              <p className="text-sm text-foreground/80">
                {partnerName} · {selectedType?.icon} {selectedType?.label}
              </p>
            </div>

            {response ? (
              <div className="glass-card p-5">
                <ReadingDisplay text={response} />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-gold/60 ml-1 align-middle"
                />
              </div>
            ) : (
              <div className="glass-card p-8 flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="text-3xl"
                >
                  ⚖
                </motion.div>
                <p className="text-sm text-muted-foreground/60">Consulting the charts…</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Result */}
        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Partner recap */}
            <div className="glass-card p-4 border-gold/10">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">
                Compatibility reading
              </p>
              <p className="text-sm text-foreground/80">
                {partnerName} · {selectedType?.icon} {selectedType?.label}
              </p>
            </div>

            <div className="glass-card p-5">
              <ReadingDisplay text={response} />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-xs text-foreground/50 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5"
            >
              <span className="text-gold/60">📖</span>
              <span>This reading has been saved to your compatibility history.</span>
            </motion.div>

            <div className="flex items-center gap-3">
              <ShareToFeed
                content={response.slice(0, 500)}
                postType="compatibility"
                label="Share to Collective"
                className="flex-1 text-center"
              />
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
              >
                Read another connection
              </button>
            </div>
          </motion.div>
        )}

        {/* History */}
        {step === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-gold/50 uppercase tracking-widest">Past readings</p>
              <button
                onClick={() => setStep("form")}
                className="text-xs text-muted-foreground/60 hover:text-gold/70 transition-colors"
              >
                ← New reading
              </button>
            </div>

            {pastReports.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm text-muted-foreground/60">No compatibility readings yet.</p>
                <button
                  onClick={() => setStep("form")}
                  className="mt-4 text-xs text-gold/70 hover:text-gold transition-colors"
                >
                  Start your first reading →
                </button>
              </div>
            ) : selectedReport ? (
              <div className="space-y-4">
                <div className="glass-card p-4 border-gold/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gold/50 uppercase tracking-widest mb-0.5">
                        {
                          RELATIONSHIP_TYPES.find(
                            (r) => r.value === selectedReport.relationship_type
                          )?.icon
                        }{" "}
                        {selectedReport.relationship_type}
                      </p>
                      <p className="text-sm text-foreground font-medium">
                        {selectedReport.partner_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
                <div className="glass-card p-5">
                  <ReadingDisplay text={selectedReport.report_json.text} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pastReports.map((report) => {
                  const type = RELATIONSHIP_TYPES.find((r) => r.value === report.relationship_type);
                  const date = new Date(report.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="w-full glass-card p-4 text-left hover:border-gold/15 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{type?.icon ?? "✦"}</span>
                          <div>
                            <p className="text-sm text-foreground font-medium group-hover:text-gold-200 transition-colors">
                              {report.partner_name}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {type?.label} ·{" "}
                              {report.partner_birth_data_json?.chart?.sun ?? "Unknown"} Sun
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground/40">{date}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section legend (only on form step) */}
      {step === "form" && (
        <div className="flex flex-wrap gap-1.5">
          {SECTION_ICONS.map((icon, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-full bg-white/[0.02] border border-white/[0.04] text-muted-foreground/40"
            >
              {icon}
            </span>
          ))}
          <span className="text-xs px-2 py-1 text-muted-foreground/30">7 dimensions analyzed</span>
        </div>
      )}
    </div>
  );
}
