import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PublicGuideInviteContext, PublicGuideProfile } from "@/lib/guide/public-profile";

interface PublicGuidePageProps {
  guide: PublicGuideProfile;
  invitation?: PublicGuideInviteContext;
}

const THEME_STYLES = {
  gold: {
    shell:
      "bg-[radial-gradient(circle_at_top,_rgba(201,168,76,0.16),_transparent_32%),linear-gradient(180deg,_#09090b_0%,_#0c0c10_48%,_#09090b_100%)] text-[#f4efe2]",
    panel:
      "border-gold/[0.15] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]",
    chip: "border-gold/20 bg-gold/[0.08] text-gold-50",
    eyebrow: "text-gold/70",
    accent: "text-gold-100",
    accentSoft: "text-gold/[0.65]",
    primaryButton:
      "bg-gradient-to-r from-gold-200 via-[#dfc063] to-bronze text-obsidian shadow-[0_18px_55px_rgba(201,168,76,0.2)] hover:opacity-92",
    secondaryButton: "border border-gold/25 bg-gold/[0.06] text-gold-50 hover:bg-gold/[0.1]",
    divider: "from-transparent via-gold/25 to-transparent",
  },
  plum: {
    shell:
      "bg-[radial-gradient(circle_at_top,_rgba(132,92,204,0.2),_transparent_34%),linear-gradient(180deg,_#0b0910_0%,_#120d1a_50%,_#09090d_100%)] text-[#f1ebff]",
    panel:
      "border-violet-400/[0.18] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(113,63,177,0.06))]",
    chip: "border-violet-400/20 bg-violet-500/[0.12] text-violet-50",
    eyebrow: "text-violet-200/70",
    accent: "text-violet-100",
    accentSoft: "text-violet-200/[0.65]",
    primaryButton:
      "bg-[linear-gradient(90deg,rgba(196,181,253,0.95),rgba(139,92,246,0.92))] text-[#120d1a] shadow-[0_18px_55px_rgba(139,92,246,0.18)] hover:opacity-92",
    secondaryButton:
      "border border-violet-400/[0.22] bg-violet-500/[0.08] text-violet-50 hover:bg-violet-500/[0.14]",
    divider: "from-transparent via-violet-400/25 to-transparent",
  },
  rose: {
    shell:
      "bg-[radial-gradient(circle_at_top,_rgba(212,164,151,0.18),_transparent_35%),linear-gradient(180deg,_#110d0d_0%,_#171012_44%,_#0b090b_100%)] text-[#f7ede7]",
    panel:
      "border-rose-200/[0.15] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(196,160,154,0.06))]",
    chip: "border-rose-200/[0.18] bg-rose-200/[0.08] text-rose-50",
    eyebrow: "text-rose-200/70",
    accent: "text-rose-50",
    accentSoft: "text-rose-100/[0.65]",
    primaryButton:
      "bg-[linear-gradient(90deg,rgba(234,179,167,0.96),rgba(184,134,11,0.94))] text-[#120d0d] shadow-[0_18px_55px_rgba(196,160,154,0.18)] hover:opacity-92",
    secondaryButton:
      "border border-rose-200/[0.18] bg-rose-200/[0.06] text-rose-50 hover:bg-rose-200/[0.1]",
    divider: "from-transparent via-rose-200/25 to-transparent",
  },
} as const;

const BENEFITS = [
  {
    title: "Private client inbox",
    description:
      "Readings and follow-ups stay separated from the rest of the app inside My Guidance.",
  },
  {
    title: "No subscription required",
    description: "Clients can receive personal readings on a free Daily Libra account.",
  },
  {
    title: "Designed for return visits",
    description: "Login later and your guide relationship, readings, and notes are still there.",
  },
] as const;

const PROCESS = [
  "Your guide sends you an invitation or your next reading.",
  "You create a free account or sign in to the same email.",
  "Everything lands in your private Guidance inbox.",
] as const;

function buildPrimaryHref(invitation?: PublicGuideInviteContext) {
  return invitation
    ? `/signup?guide_token=${invitation.token}&next=/guidance`
    : "/signup?next=/guidance";
}

function buildSecondaryHref(invitation?: PublicGuideInviteContext) {
  return invitation
    ? `/login?guide_token=${invitation.token}&next=/guidance`
    : "/login?next=/guidance";
}

export function PublicGuidePage({ guide, invitation }: PublicGuidePageProps) {
  const theme = THEME_STYLES[guide.profileTheme];
  const isSpotlight = guide.profileLayout === "spotlight";
  const isPortrait = guide.profileLayout === "portrait";
  const primaryHref = buildPrimaryHref(invitation);
  const secondaryHref = buildSecondaryHref(invitation);
  const guideTitle = guide.welcomeHeadline?.trim() || `Work with ${guide.brandName}.`;
  const primaryLabel = invitation
    ? "Accept Invitation & Create Account"
    : guide.ctaLabel?.trim() || "Create Free Client Account";

  return (
    <div className={cn("min-h-screen overflow-hidden", theme.shell)}>
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[140px]" />
        <div className="absolute right-[-8rem] top-[18rem] h-[22rem] w-[22rem] rounded-full bg-white/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-10">
        <header className="flex items-center justify-between pb-8">
          <Link
            href="/"
            className={cn("text-xs uppercase tracking-[0.35em] transition-colors", theme.eyebrow)}
          >
            The Daily Libra
          </Link>
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-white/[0.4]">
            <span className={cn("h-px w-10 bg-gradient-to-r", theme.divider)} />
            Guide Studio
          </div>
        </header>

        <main className="flex-1">
          {isSpotlight ? (
            <div className="mx-auto max-w-5xl space-y-8 text-center">
              {invitation && (
                <div
                  className={cn(
                    "mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs",
                    theme.panel
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  Invitation for {invitation.clientName?.split(" ")[0] ?? "you"}
                </div>
              )}

              <div className="space-y-5">
                <p className={cn("text-xs uppercase tracking-[0.35em]", theme.eyebrow)}>
                  {guide.guideRole === "high_priest" ? "High Priest Guide" : "High Priestess Guide"}
                </p>
                <h1 className="mx-auto max-w-4xl font-serif text-display-md leading-tight md:text-display-xl">
                  {guideTitle}
                </h1>
                <p className={cn("text-lg md:text-xl", theme.accentSoft)}>
                  {guide.tagline ?? "Personal astrology, delivered with care and clarity."}
                </p>
                <p className="mx-auto max-w-3xl text-sm leading-7 text-white/[0.72] md:text-base">
                  {guide.bio ??
                    `${guide.brandName} uses The Daily Libra to send personalized astrology guidance, custom readings, and client follow-up in one polished space.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {guide.specialties.slice(0, 6).map((specialty) => (
                  <span
                    key={specialty}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]",
                      theme.chip
                    )}
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div
                className={cn("mx-auto max-w-4xl rounded-[2rem] border p-7 md:p-9", theme.panel)}
              >
                <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:text-left">
                  <div className="space-y-4">
                    <GuideIdentityCard guide={guide} theme={theme} />
                  </div>
                  <GuideActionPanel
                    guide={guide}
                    invitation={invitation}
                    primaryHref={primaryHref}
                    primaryLabel={primaryLabel}
                    secondaryHref={secondaryHref}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "grid items-start gap-8 lg:gap-10",
                isPortrait ? "xl:grid-cols-[0.84fr_1.16fr]" : "xl:grid-cols-[1.18fr_0.82fr]"
              )}
            >
              <section className={cn("space-y-8", isPortrait && "xl:order-2")}>
                {invitation && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs",
                      theme.panel
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    Invitation for {invitation.clientName?.split(" ")[0] ?? "you"}
                  </div>
                )}

                <div className="space-y-5">
                  <p className={cn("text-xs uppercase tracking-[0.35em]", theme.eyebrow)}>
                    {guide.guideRole === "high_priest" ? "High Priest Guide" : "High Priestess Guide"}
                  </p>
                  <h1 className="max-w-3xl font-serif text-display-md leading-tight md:text-display-xl">
                    {guideTitle}
                  </h1>
                  <p className={cn("max-w-2xl text-lg md:text-xl", theme.accentSoft)}>
                    {guide.tagline ?? "Personal astrology, delivered with care and clarity."}
                  </p>
                  <p className="max-w-2xl text-sm leading-7 text-white/[0.72] md:text-base">
                    {guide.bio ??
                      `${guide.brandName} uses The Daily Libra to send personalized astrology guidance, custom readings, and client follow-up in one polished space.`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {guide.specialties.slice(0, 6).map((specialty) => (
                    <span
                      key={specialty}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em]",
                        theme.chip
                      )}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard
                    label="Active clients"
                    value={`${guide.clientsCount}`}
                    theme={theme}
                  />
                  <MetricCard label="Client spots" value={`${guide.clientSlots}`} theme={theme} />
                  <MetricCard
                    label="Readings delivered"
                    value={`${guide.publishedReadings}`}
                    theme={theme}
                  />
                </div>

                <div className={cn("rounded-[2rem] border p-6 md:p-7", theme.panel)}>
                  <p className={cn("text-xs uppercase tracking-[0.3em]", theme.eyebrow)}>
                    What clients get
                  </p>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {BENEFITS.map((benefit) => (
                      <div
                        key={benefit.title}
                        className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.02] p-5"
                      >
                        <p className={cn("text-sm font-medium", theme.accent)}>{benefit.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/[0.68]">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className={cn("space-y-5", isPortrait && "xl:order-1")}>
                <div className={cn("rounded-[2rem] border p-6 md:p-7", theme.panel)}>
                  <GuideIdentityCard guide={guide} theme={theme} />
                </div>
                <div className={cn("rounded-[2rem] border p-6 md:p-7", theme.panel)}>
                  <GuideActionPanel
                    guide={guide}
                    invitation={invitation}
                    primaryHref={primaryHref}
                    primaryLabel={primaryLabel}
                    secondaryHref={secondaryHref}
                    theme={theme}
                  />
                </div>
              </aside>
            </div>
          )}

          <section className="mx-auto mt-10 max-w-6xl">
            <div className={cn("rounded-[2rem] border p-6 md:p-8", theme.panel)}>
              <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr] md:items-start">
                <div>
                  <p className={cn("text-xs uppercase tracking-[0.3em]", theme.eyebrow)}>
                    How it works
                  </p>
                  <h2 className="mt-3 font-serif text-display-xs">A cleaner client path.</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/[0.68]">
                    If you already purchased services from this guide, your login is simply your
                    Daily Libra client account. Sign in and open My Guidance.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {PROCESS.map((step, index) => (
                    <div
                      key={step}
                      className="rounded-[1.35rem] border border-white/[0.08] bg-white/[0.02] p-5"
                    >
                      <p className={cn("text-xs uppercase tracking-[0.3em]", theme.eyebrow)}>
                        Step {index + 1}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/[0.78]">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function GuideIdentityCard({
  guide,
  theme,
}: {
  guide: PublicGuideProfile;
  theme: (typeof THEME_STYLES)[keyof typeof THEME_STYLES];
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {guide.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.avatarUrl}
            alt={guide.brandName}
            className="h-20 w-20 rounded-[1.4rem] object-cover border border-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-white/10 bg-white/[0.04] text-3xl">
            🌙
          </div>
        )}
        <div>
          <p className={cn("text-xs uppercase tracking-[0.3em]", theme.eyebrow)}>Seller profile</p>
          <h2 className="mt-2 font-serif text-2xl">{guide.brandName}</h2>
          <p className="mt-1 text-sm text-white/[0.6]">{guide.displayName}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Clients" value={`${guide.clientsCount}`} theme={theme} compact />
        <MetricCard label="Readings" value={`${guide.publishedReadings}`} theme={theme} compact />
        <MetricCard label="Slots" value={`${guide.clientSlots}`} theme={theme} compact />
      </div>

      {guide.websiteUrl && (
        <Link
          href={guide.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-2 text-sm transition-colors",
            theme.accentSoft
          )}
        >
          Visit website
          <span aria-hidden="true">↗</span>
        </Link>
      )}
    </div>
  );
}

function GuideActionPanel({
  guide,
  invitation,
  primaryHref,
  primaryLabel,
  secondaryHref,
  theme,
}: {
  guide: PublicGuideProfile;
  invitation?: PublicGuideInviteContext;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  theme: (typeof THEME_STYLES)[keyof typeof THEME_STYLES];
}) {
  return (
    <div className="flex h-full flex-col">
      <p className={cn("text-xs uppercase tracking-[0.3em]", theme.eyebrow)}>
        {invitation ? "Accept your access" : "Client access"}
      </p>
      <h3 className="mt-3 font-serif text-2xl">
        {invitation ? "Your inbox starts here." : "Already bought from this guide?"}
      </h3>
      <p className="mt-3 text-sm leading-7 text-white/[0.7]">
        {invitation
          ? `Create a free account or sign in to receive readings from ${guide.brandName} inside your private Guidance space.`
          : `Your login is your Daily Libra client account. Sign in to open My Guidance, or create a free account to receive new readings.`}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={primaryHref}
          className={cn(
            "rounded-full px-6 py-4 text-center text-sm font-semibold transition-all",
            theme.primaryButton
          )}
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className={cn(
            "rounded-full px-6 py-4 text-center text-sm font-medium transition-all",
            theme.secondaryButton
          )}
        >
          Already Have an Account? Sign In
        </Link>
      </div>

      <div className="mt-6 rounded-[1.35rem] border border-white/[0.08] bg-white/[0.02] p-4">
        <p className={cn("text-[11px] uppercase tracking-[0.28em]", theme.eyebrow)}>
          Private guidance
        </p>
        <p className="mt-2 text-sm leading-6 text-white/[0.68]">
          Readings land in My Guidance after login. No subscription is required for clients
          receiving private work from a High Priestess.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  theme,
  compact = false,
}: {
  label: string;
  value: string;
  theme: (typeof THEME_STYLES)[keyof typeof THEME_STYLES];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-white/[0.08] bg-white/[0.02] p-4",
        compact && "p-3"
      )}
    >
      <p className={cn("text-[11px] uppercase tracking-[0.26em]", theme.eyebrow)}>{label}</p>
      <p
        className={cn("mt-2 font-serif text-3xl", compact ? "text-2xl" : "text-3xl", theme.accent)}
      >
        {value}
      </p>
    </div>
  );
}
