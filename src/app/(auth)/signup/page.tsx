"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const guideToken = searchParams.get("guide_token");
  const nextPath = (() => {
    const requested = searchParams.get("next") ?? "/dashboard";
    return requested.startsWith("/") ? requested : "/dashboard";
  })();

  useEffect(() => {
    // Prefer URL param, fallback to localStorage (set by /join/[code] page)
    const urlRef = searchParams.get("ref");
    const storedRef = typeof window !== "undefined" ? localStorage.getItem("ref_code") : null;
    setRefCode(urlRef || storedRef);

    if (guideToken) {
      localStorage.setItem("guide_token", guideToken);
    }
  }, [guideToken, searchParams]);

  async function claimReferral() {
    if (!refCode) return;
    try {
      await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: refCode }),
      });
      localStorage.removeItem("ref_code");
    } catch {
      // non-fatal
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await claimReferral();
    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setLoading(true);
    // Persist ref code so auth/callback can claim it after OAuth redirect
    if (refCode) localStorage.setItem("ref_code", refCode);
    if (guideToken) localStorage.setItem("guide_token", guideToken);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", nextPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="glass-card p-10">
          <span className="text-5xl block mb-4">✉️</span>
          <h2 className="font-serif text-display-xs text-foreground mb-3">Check your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account and begin your Libra profile.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-card p-8">
        <h1 className="font-serif text-display-xs text-foreground mb-1">
          Start your Libra profile.
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {nextPath === "/guidance"
            ? "Create your free client account to receive private readings."
            : "Free forever. No card required."}
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition-colors text-sm"
              placeholder="What should we call you?"
            />
          </div>

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

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 transition-colors text-sm"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </form>

        <div className="cosmic-divider my-6">
          <span className="text-xs text-muted-foreground/50 px-3">or</span>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-3 rounded-full border border-white/10 text-foreground text-sm hover:border-gold/30 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-gold/60 hover:text-gold transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gold/60 hover:text-gold transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-200 hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
