"use client";

import { useState, useEffect } from "react";
import { ClientCard } from "@/components/guide/client-card";
import { InviteClientForm } from "@/components/guide/invite-form";
import { motion, AnimatePresence } from "framer-motion";

export default function GuideClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    fetch("/api/guide/clients")
      .then((r) => r.json())
      .then((d) => {
        setClients(d.clients ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-display-xs text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.filter((c) => c.status === "active").length} active ·{" "}
            {clients.filter((c) => c.status === "pending").length} pending
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 rounded-full bg-gold/[0.1] border border-gold/25 text-gold/80 text-sm hover:bg-gold/[0.18] transition-all"
        >
          + Invite Client
        </button>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="glass-card p-8 w-full max-w-md"
            >
              <h2 className="font-serif text-xl text-foreground mb-6">Invite a Client</h2>
              <InviteClientForm onClose={() => setShowInvite(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {clients.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <span className="text-4xl block">🌙</span>
          <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-sm mx-auto">
            No clients yet. Send your first invitation and start delivering personalized readings.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="text-sm text-gold/70 hover:text-gold transition-colors"
          >
            Send an invitation →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              connection={c}
              readingCount={c.reading_count ?? 0}
              unreadCount={c.unread_count ?? 0}
              lastReadingDate={c.last_reading_date ?? null}
              linkedUser={c.linked_user ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
