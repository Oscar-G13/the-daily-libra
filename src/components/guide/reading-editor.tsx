"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const READING_TYPES = [
  { value: "custom", label: "Personal Reading", icon: "✦" },
  { value: "love_forecast", label: "Love Forecast", icon: "🌹" },
  { value: "year_ahead", label: "Year Ahead", icon: "🌟" },
  { value: "natal_summary", label: "Natal Chart Summary", icon: "♎" },
  { value: "transit_report", label: "Transit Report", icon: "🪐" },
  { value: "monthly", label: "Monthly Reading", icon: "🌙" },
] as const;

interface ReadingEditorProps {
  clientId: string;
  clientName: string;
  /** If provided, we're editing an existing reading */
  readingId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialType?: string;
  initialPublished?: boolean;
}

export function ReadingEditor({
  clientId,
  clientName,
  readingId,
  initialTitle = "",
  initialContent = "",
  initialType = "custom",
  initialPublished = false,
}: ReadingEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [readingType, setReadingType] = useState(initialType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(publish: boolean) {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");

    let res: Response;
    if (readingId) {
      // Editing existing
      res = await fetch(`/api/guide/clients/${clientId}/reading/${readingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, reading_type: readingType, is_published: publish }),
      });
    } else {
      // Creating new
      res = await fetch(`/api/guide/clients/${clientId}/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, reading_type: readingType, publish }),
      });
    }

    if (res.ok) {
      router.push(`/guide/clients/${clientId}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-display-xs text-foreground">
          {readingId ? "Edit Reading" : "New Reading"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">For {clientName}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Reading type */}
      <div className="glass-card p-5 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Reading Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {READING_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setReadingType(type.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all",
                readingType === type.value
                  ? "bg-gold/[0.08] border-gold/30 text-gold/80"
                  : "border-white/[0.08] text-muted-foreground/60 hover:border-gold/20 hover:text-foreground/70"
              )}
            >
              <span>{type.icon}</span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="glass-card p-5 space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Your Venus Return — What's Coming for Love"
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/30 focus:outline-none text-base font-serif"
        />
      </div>

      {/* Content */}
      <div className="glass-card p-5 space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">
          Reading Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          placeholder="Write the reading here. Be specific, personal, and grounded in their chart when possible..."
          className="w-full bg-transparent text-foreground/85 placeholder:text-muted-foreground/25 focus:outline-none text-sm leading-relaxed resize-none"
        />
        <p className="text-xs text-muted-foreground/30 text-right">{content.length} chars</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || initialPublished}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {initialPublished ? "Published ✓" : saving ? "Publishing..." : "Publish to Client"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground/30 text-center">
        Publishing sends an email notification to your client.
      </p>
    </div>
  );
}
