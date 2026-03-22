import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingArchetypes } from "@/components/landing/archetypes";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";
import { CosmicBackground } from "@/components/ui/cosmic-background";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <CosmicBackground />
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingArchetypes />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
