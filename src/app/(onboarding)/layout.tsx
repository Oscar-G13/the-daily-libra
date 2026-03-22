import { CosmicBackground } from "@/components/ui/cosmic-background";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <CosmicBackground />
      <main className="relative z-10 flex-1">
        {children}
      </main>
    </div>
  );
}
