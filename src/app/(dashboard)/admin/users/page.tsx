"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AdminUser {
  id: string;
  email: string | null;
  display_name: string | null;
  subscription_tier: string | null;
  account_status: string | null;
  is_admin: boolean | null;
  created_at: string;
}

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier || tier === "free") {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-muted-foreground/50 uppercase tracking-wider">
        free
      </span>
    );
  }
  if (tier === "premium") {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/[0.1] border border-gold/25 text-gold/80 uppercase tracking-wider">
        premium
      </span>
    );
  }
  if (tier === "high_priestess") {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/[0.12] border border-violet-400/30 text-violet-300/80 uppercase tracking-wider">
        high priestess
      </span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-muted-foreground/50 uppercase tracking-wider">
      {tier}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "active";
  const map: Record<string, string> = {
    active: "bg-emerald-500/[0.1] border-emerald-400/25 text-emerald-300/80",
    suspended: "bg-amber-500/[0.1] border-amber-400/25 text-amber-300/80",
    banned: "bg-red-500/[0.12] border-red-400/30 text-red-300/80",
    muted: "bg-sky-500/[0.1] border-sky-400/25 text-sky-300/80",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
        map[s] ?? "border-white/[0.08] text-muted-foreground/50"
      }`}
    >
      {s}
    </span>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 20;

  const load = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ search: q, page: String(p), limit: String(limit) });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to load users.");
        return;
      }
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load(search, 1);
    }, 350);
    return () => clearTimeout(t);
  }, [search, load]);

  useEffect(() => {
    load(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-2 inline-block"
          >
            ← Admin Panel
          </Link>
          <h1 className="font-serif text-display-xs text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total.toLocaleString()} {total === 1 ? "user" : "users"} total
          </p>
        </div>

        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full sm:w-72 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/30 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-4 border-red-500/20">
          <p className="text-sm text-red-400/70">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-white/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/[0.04]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/[0.04] rounded w-32" />
                  <div className="h-2.5 bg-white/[0.03] rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground/50">
              {search ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {/* Column headers */}
            <div className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center">
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">User</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest hidden sm:block">Tier</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest hidden sm:block">Status</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest hidden md:block">Role</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest hidden md:block">Joined</p>
              <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">Action</p>
            </div>

            {users.map((u) => (
              <div
                key={u.id}
                className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Name + email */}
                <div className="min-w-0">
                  <p className="text-sm text-foreground/90 truncate">
                    {u.display_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground/50 truncate mt-0.5">
                    {u.email ?? "—"}
                  </p>
                </div>

                {/* Tier */}
                <div className="hidden sm:block">
                  <TierBadge tier={u.subscription_tier} />
                </div>

                {/* Status */}
                <div className="hidden sm:block">
                  <StatusBadge status={u.account_status} />
                </div>

                {/* Admin badge */}
                <div className="hidden md:block">
                  {u.is_admin ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/[0.1] border border-gold/25 text-gold/80 uppercase tracking-wider">
                      admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/25">—</span>
                  )}
                </div>

                {/* Joined */}
                <div className="hidden md:block">
                  <p className="text-xs text-muted-foreground/40 whitespace-nowrap">
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Manage link */}
                <div>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-gold/60 hover:text-gold/90 transition-colors whitespace-nowrap"
                  >
                    Manage →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/40">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
