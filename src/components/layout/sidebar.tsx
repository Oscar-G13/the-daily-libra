"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { XPBar } from "@/components/gamification/xp-bar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "☀️" },
  { href: "/reading", label: "Readings", icon: "🔮" },
  { href: "/profile", label: "My Profile", icon: "♎" },
  { href: "/chart", label: "Birth Chart", icon: "🌙" },
  { href: "/companion", label: "AI Companion", icon: "🪞" },
  { href: "/journal", label: "Journal", icon: "📖" },
  { href: "/subscription", label: "Premium", icon: "✦" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

interface DashboardSidebarProps {
  displayName: string;
  tier: string;
  initialXP?: number;
  initialLevel?: number;
}

export function DashboardSidebar({
  displayName,
  tier,
  initialXP = 0,
  initialLevel = 1,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/[0.04]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-serif text-xl text-gold-gradient">⚖</span>
          <span className="font-serif text-base text-foreground">The Daily Libra</span>
        </Link>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/[0.04]">
        <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full inline-block mt-1",
            tier === "premium"
              ? "bg-gold/10 text-gold-200 border border-gold/20"
              : "bg-white/[0.04] text-muted-foreground border border-white/[0.06]"
          )}
        >
          {tier === "premium" ? "✦ Premium" : "Free"}
        </span>
      </div>

      {/* XP Bar */}
      <XPBar initialXP={initialXP} initialLevel={initialLevel} />

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-gold/[0.08] text-gold-200 border border-gold/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.04]">
        <p className="text-xs text-muted-foreground/40 text-center">Your chart. Your balance. ⚖</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-charcoal/50 border-r border-white/[0.04] backdrop-blur-sm z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-charcoal/80 border border-white/[0.08] backdrop-blur-sm"
        aria-label="Open menu"
      >
        <span className="block w-4 h-0.5 bg-foreground mb-1" />
        <span className="block w-4 h-0.5 bg-foreground mb-1" />
        <span className="block w-3 h-0.5 bg-foreground" />
      </button>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-charcoal border-r border-white/[0.04] z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
