import Link from "next/link";
import { CosmicBackground } from "@/components/ui/cosmic-background";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <CosmicBackground />
      <div className="relative z-10 text-center space-y-6 max-w-sm">
        <p className="font-serif text-6xl text-gold/30">404</p>
        <h1 className="font-serif text-2xl text-foreground">This page doesn&apos;t exist.</h1>
        <p className="text-sm text-muted-foreground">
          The stars didn&apos;t align on this one. Whatever you were looking for — it&apos;s not
          here.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
