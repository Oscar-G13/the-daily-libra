"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-card p-8">
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-2xl">✦</p>
            <h1 className="font-serif text-display-xs text-foreground">Check your inbox.</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We sent a reset link to <span className="text-foreground/80">{email}</span>. It
              expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-xs text-gold/60 hover:text-gold transition-colors"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-display-xs text-foreground mb-2">
              Reset your password.
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Enter your email and we&apos;ll send a reset link.
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition-colors text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link href="/login" className="text-gold-200 hover:text-gold transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
