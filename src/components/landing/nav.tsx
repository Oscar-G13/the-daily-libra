"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-obsidian/90 backdrop-blur-md border-b border-white/[0.04]" : "bg-transparent"
      )}
    >
      <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl text-gold-gradient">⚖</span>
          <span className="font-serif text-lg tracking-wide text-foreground">The Daily Libra</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#archetypes" className="hover:text-foreground transition-colors">
            Archetypes
          </Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-gradient-to-r from-gold-200 to-bronze px-5 py-2 rounded-full text-obsidian font-medium hover:opacity-90 transition-opacity"
          >
            Start Free
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
