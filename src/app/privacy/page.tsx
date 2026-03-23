import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="text-xs text-gold/50 hover:text-gold/80 transition-colors">
            ← The Daily Libra
          </Link>
          <h1 className="font-serif text-3xl text-foreground mt-4 mb-2">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="prose prose-sm prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">What we collect</h2>
            <p>
              When you create an account, we collect your email address and the display name you
              provide. During onboarding, we collect your birth date, birth time (optional), and
              birth location to calculate your natal chart. We also collect your responses to our
              archetype quiz and, if you complete it, the psychographic assessment.
            </p>
            <p>
              As you use the app, we log journal entries you write, mood check-ins you submit, AI
              conversations you have with the companion, and readings you request. This data is
              associated with your account and stored in our database.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">How we use it</h2>
            <p>
              Your birth data and assessment results are used exclusively to personalize your
              readings and AI companion responses. We do not sell this data, share it with
              advertisers, or use it for any purpose other than delivering the service to you.
            </p>
            <p>
              We use PostHog for product analytics to understand how people use the app in
              aggregate. This data is anonymized and does not include the content of your readings,
              journal entries, or conversations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Third-party services</h2>
            <p>We use the following services to operate the app:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong className="text-foreground/90">Supabase</strong> — database and
                authentication
              </li>
              <li>
                <strong className="text-foreground/90">OpenAI</strong> — AI reading and companion
                generation
              </li>
              <li>
                <strong className="text-foreground/90">Stripe</strong> — payment processing
              </li>
              <li>
                <strong className="text-foreground/90">Vercel</strong> — hosting and deployment
              </li>
              <li>
                <strong className="text-foreground/90">PostHog</strong> — product analytics
              </li>
            </ul>
            <p>
              Your birth data and journal content are sent to OpenAI to generate readings and
              companion responses. OpenAI&apos;s API does not use this data to train models by
              default. See OpenAI&apos;s privacy policy for details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Data retention and deletion</h2>
            <p>
              We retain your data for as long as your account exists. If you delete your account,
              all associated data — including your birth profile, journal entries, readings, and
              assessment results — is permanently deleted within 30 days.
            </p>
            <p>
              To request account deletion, email us at{" "}
              <a href="mailto:privacy@thedailylibra.com" className="text-gold/70 hover:text-gold">
                privacy@thedailylibra.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Cookies</h2>
            <p>
              We use cookies only for authentication — to keep you logged in between sessions. We do
              not use advertising cookies or tracking pixels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-lg text-foreground">Contact</h2>
            <p>
              Questions about this policy? Reach us at{" "}
              <a href="mailto:privacy@thedailylibra.com" className="text-gold/70 hover:text-gold">
                privacy@thedailylibra.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
