import { CosmicBackground } from "@/components/ui/cosmic-background";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <CosmicBackground />

      {/* Nav */}
      <nav className="relative z-10 p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="font-serif text-xl text-gold-gradient">⚖</span>
          <span className="font-serif text-lg text-foreground">The Daily Libra</span>
        </Link>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
