"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteClientForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    const res = await fetch("/api/guide/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_email: email,
        client_name: name || null,
        client_birth_date: birthDate || null,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSent(true);
      router.refresh();
      setTimeout(onClose, 2500);
    } else {
      setError(data.error ?? "Failed to send invitation.");
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-8 space-y-3">
        <span className="text-4xl block">✉️</span>
        <p className="text-sm text-foreground/80">Invitation sent to {email}</p>
        <p className="text-xs text-muted-foreground/50">
          They&apos;ll receive an email to accept and access their readings.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Client Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="client@example.com"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Client Name <span className="text-muted-foreground/30">(optional)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name or full name"
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/40 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
          Birth Date <span className="text-muted-foreground/30">(optional — for transits)</span>
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 text-sm"
        />
      </div>

      {error && (
        <p className="text-sm text-red-300/80 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-full border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex-1 py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Invitation"}
        </button>
      </div>
    </form>
  );
}
