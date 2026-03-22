import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.04] py-10 px-6">
      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif text-gold">⚖</span>
          <span className="font-serif text-sm text-muted-foreground">The Daily Libra</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </div>

        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} The Daily Libra. Built for Libras.
        </p>
      </div>
    </footer>
  );
}
