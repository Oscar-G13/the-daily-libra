import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-gold/50 hover:text-gold/80 transition-colors">
            ← The Daily Libra
          </Link>
          <h1 className="font-serif text-3xl text-foreground mt-4 mb-2">Terms of Service</h1>
          <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">What this is</h2>
            <p>
              The Daily Libra is a personalized astrology and self-reflection app. Our readings,
              companion responses, and assessments are for personal insight and entertainment
              purposes only. They are not professional psychological advice, medical advice, or
              financial guidance. If you are experiencing a mental health crisis, please contact a
              qualified professional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Your account</h2>
            <p>
              You must be 18 years or older to create an account. You are responsible for keeping
              your login credentials secure. You may not share your account or use it on behalf of
              anyone else.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Subscriptions and billing</h2>
            <p>
              The free tier gives you access to daily readings, the birth chart, journal, and
              limited AI companion messages. Premium ($12/month or $96/year) unlocks unlimited
              readings across all categories and unlimited AI companion access.
            </p>
            <p>
              Subscriptions renew automatically. You can cancel at any time from your subscription
              settings — cancellation takes effect at the end of the current billing period. We do
              not offer refunds for partial billing periods.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use the app to harass, harm, or deceive others</li>
              <li>Attempt to reverse-engineer or scrape the AI outputs at scale</li>
              <li>Create multiple accounts to circumvent free tier limits</li>
              <li>Use the service for any unlawful purpose</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Intellectual property</h2>
            <p>
              The app, its design, and its AI-generated content are owned by The Daily Libra. You
              own the content you create — your journal entries are yours. You grant us a license to
              store and display them to you within the app.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Limitation of liability</h2>
            <p>
              The Daily Libra is provided as-is. We are not liable for decisions you make based on
              readings or AI companion responses. We make no guarantees about uptime or the accuracy
              of astrological calculations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Changes to these terms</h2>
            <p>
              We may update these terms. If changes are material, we will notify you by email.
              Continued use of the app after changes means you accept the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Contact</h2>
            <p>
              Questions?{" "}
              <a href="mailto:hello@thedailylibra.com" className="text-gold/70 hover:text-gold">
                hello@thedailylibra.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
