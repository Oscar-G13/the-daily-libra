"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { XPBar } from "@/components/gamification/xp-bar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "☀️", pro: false },
  { href: "/insight-quiz", label: "Insight Session", icon: "🧠", pro: true },
  { href: "/reading", label: "Readings", icon: "🔮", pro: false },
  { href: "/compatibility", label: "Compatibility Lab", icon: "🌹", pro: false },
  { href: "/decision", label: "Decision Decoder", icon: "⚖", pro: false },
  { href: "/text-decoder", label: "Text Decoder", icon: "📱", pro: true },
  { href: "/red-flag", label: "Red Flag Decoder", icon: "🚩", pro: true },
  { href: "/cosmic-room", label: "Cosmic Room", icon: "✦", pro: true },
  { href: "/moon", label: "Moon Calendar", icon: "🌙", pro: false },
  { href: "/profile", label: "My Profile", icon: "♎", pro: false },
  { href: "/aesthetic", label: "Aesthetic Profile", icon: "♀", pro: false },
  { href: "/chart", label: "Birth Chart", icon: "✦", pro: false },
  { href: "/companion", label: "AI Companion", icon: "🪞", pro: false },
  { href: "/journal", label: "Journal", icon: "📖", pro: false },
  { href: "/community", label: "The Collective", icon: "🌐", pro: false },
  { href: "/subscription", label: "Premium", icon: "💎", pro: false },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const GUIDE_NAV_ITEMS = [
  { href: "/guide", label: "Guide Studio", icon: "🌙" },
  { href: "/guide/clients", label: "My Clients", icon: "✦" },
  { href: "/guide/profile", label: "Studio Profile", icon: "♎" },
];

interface DashboardSidebarProps {
  displayName: string;
  tier: string;
  initialXP?: number;
  initialLevel?: number;
  hasGuidance?: boolean;
  isAdmin?: boolean;
}

export function DashboardSidebar({
  displayName,
  tier,
  initialXP = 0,
  initialLevel = 1,
  hasGuidance = false,
  isAdmin = false,
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
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate flex-1">{displayName}</p>
          {isAdmin && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold/15 text-gold-200 border border-gold/30 font-bold tracking-wide shrink-0">
              ADMIN
            </span>
          )}
        </div>
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full inline-block mt-1",
            tier === "high_priestess"
              ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
              : tier === "premium"
              ? "bg-gold/10 text-gold-200 border border-gold/20"
              : "bg-white/[0.04] text-muted-foreground border border-white/[0.06]"
          )}
        >
          {tier === "high_priestess" ? "🌙 High Priestess" : tier === "premium" ? "✦ Premium" : "Free"}
        </span>
      </div>

      {/* XP Bar */}
      <XPBar initialXP={initialXP} initialLevel={initialLevel} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
              <span className="flex-1">{item.label}</span>
              {item.pro && tier !== "premium" && tier !== "high_priestess" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/[0.08] text-gold/50 border border-gold/10 font-medium">
                  PRO
                </span>
              )}
            </Link>
          );
        })}

        {/* My Guidance — visible when user has an active guide connection */}
        {hasGuidance && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/30">Guidance</p>
            </div>
            <Link
              href="/guidance"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                pathname === "/guidance" || pathname.startsWith("/guidance/")
                  ? "bg-gold/[0.08] text-gold-200 border border-gold/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              )}
            >
              <span className="text-base">📬</span>
              <span className="flex-1">My Guidance</span>
            </Link>
          </>
        )}

        {/* Guide Studio — visible only for High Priestess subscribers */}
        {tier === "high_priestess" && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/30">Guide Studio</p>
            </div>
            {GUIDE_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/guide" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-violet-500/[0.08] text-violet-300 border border-violet-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-[10px] uppercase tracking-widest text-gold/40">Admin</p>
            </div>
            {[
              { href: "/admin", label: "Admin Panel", icon: "⚙" },
              { href: "/admin/users", label: "Users", icon: "👥" },
            ].map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
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
