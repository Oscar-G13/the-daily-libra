import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-lg mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-gold/50 hover:text-gold/80 transition-colors">
            ← The Daily Libra
          </Link>
          <h1 className="font-serif text-3xl text-foreground mt-4 mb-2">Get in touch.</h1>
          <p className="text-sm text-muted-foreground">We read every email.</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">General</p>
              <a
                href="mailto:hello@thedailylibra.com"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                hello@thedailylibra.com
              </a>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Privacy & Data</p>
              <a
                href="mailto:privacy@thedailylibra.com"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                privacy@thedailylibra.com
              </a>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-gold/50 uppercase tracking-widest mb-1">Billing</p>
              <a
                href="mailto:billing@thedailylibra.com"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                billing@thedailylibra.com
              </a>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            We typically respond within 24–48 hours on business days.
          </p>
        </div>
      </div>
    </div>
  );
}
