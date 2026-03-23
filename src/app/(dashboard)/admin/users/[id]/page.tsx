"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type AccountStatus = "active" | "suspended" | "banned" | "muted";
type SubscriptionTier = "free" | "premium" | "high_priestess";
type AlertType = "info" | "warning" | "ban" | "mute" | "suspension";

interface AdminUserDetail {
  id: string;
  email: string | null;
  display_name: string | null;
  subscription_tier: SubscriptionTier | null;
  is_admin: boolean | null;
  account_status: AccountStatus | null;
  muted_until: string | null;
  app_streak: number | null;
  xp_level: number | null;
  created_at: string;
  share_token: string | null;
  avatar_url?: string | null;
}

const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "banned", label: "Banned" },
  { value: "muted", label: "Muted" },
];

const TIERS: { value: SubscriptionTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "high_priestess", label: "High Priestess" },
];

const ALERT_TYPES: { value: AlertType; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "ban", label: "Ban" },
  { value: "mute", label: "Mute" },
  { value: "suspension", label: "Suspension" },
];

function statusColor(status: AccountStatus | null) {
  switch (status) {
    case "active": return "bg-emerald-500/[0.1] border-emerald-400/25 text-emerald-300/80";
    case "suspended": return "bg-amber-500/[0.1] border-amber-400/25 text-amber-300/80";
    case "banned": return "bg-red-500/[0.12] border-red-400/30 text-red-300/80";
    case "muted": return "bg-sky-500/[0.1] border-sky-400/25 text-sky-300/80";
    default: return "border-white/[0.08] text-muted-foreground/50";
  }
}

function Feedback({ msg, isError }: { msg: string; isError?: boolean }) {
  return (
    <p className={`text-xs mt-2 ${isError ? "text-red-400/70" : "text-emerald-400/70"}`}>
      {msg}
    </p>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Moderation panel state
  const [modStatus, setModStatus] = useState<AccountStatus>("active");
  const [mutedUntil, setMutedUntil] = useState("");
  const [modSaving, setModSaving] = useState(false);
  const [modFeedback, setModFeedback] = useState("");
  const [modIsError, setModIsError] = useState(false);

  // Subscription panel state
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [tierSaving, setTierSaving] = useState(false);
  const [tierFeedback, setTierFeedback] = useState("");
  const [tierIsError, setTierIsError] = useState(false);

  // Alert panel state
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("info");
  const [alertSending, setAlertSending] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState("");
  const [alertIsError, setAlertIsError] = useState(false);

  // Admin toggle state
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState("");
  const [adminIsError, setAdminIsError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError("");
    fetch(`/api/admin/users/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setFetchError(d.error ?? "Failed to load user.");
          return;
        }
        const data = await res.json();
        const u: AdminUserDetail = data.user;
        setUser(u);
        setModStatus((u.account_status as AccountStatus) ?? "active");
        setMutedUntil(u.muted_until ? u.muted_until.slice(0, 16) : "");
        setTier((u.subscription_tier as SubscriptionTier) ?? "free");
      })
      .catch(() => setFetchError("Network error."))
      .finally(() => setLoading(false));
  }, [id]);

  async function applyStatus() {
    setModSaving(true);
    setModFeedback("");
    try {
      const body: Record<string, unknown> = { account_status: modStatus };
      if (modStatus === "muted") {
        body.muted_until = mutedUntil ? new Date(mutedUntil).toISOString() : null;
      } else {
        body.muted_until = null;
      }
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setModIsError(true);
        setModFeedback(data.error ?? "Failed to update status.");
      } else {
        setModIsError(false);
        setModFeedback("Status updated.");
        setUser((prev) => prev ? { ...prev, account_status: modStatus, muted_until: body.muted_until as string | null } : prev);
      }
    } catch {
      setModIsError(true);
      setModFeedback("Network error.");
    } finally {
      setModSaving(false);
    }
  }

  async function updateTier() {
    setTierSaving(true);
    setTierFeedback("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_tier: tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTierIsError(true);
        setTierFeedback(data.error ?? "Failed to update tier.");
      } else {
        setTierIsError(false);
        setTierFeedback("Tier updated.");
        setUser((prev) => prev ? { ...prev, subscription_tier: tier } : prev);
      }
    } catch {
      setTierIsError(true);
      setTierFeedback("Network error.");
    } finally {
      setTierSaving(false);
    }
  }

  async function sendAlert() {
    if (!alertMessage.trim()) {
      setAlertIsError(true);
      setAlertFeedback("Message cannot be empty.");
      return;
    }
    setAlertSending(true);
    setAlertFeedback("");
    try {
      const res = await fetch(`/api/admin/users/${id}/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: alertMessage.trim(), alert_type: alertType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertIsError(true);
        setAlertFeedback(data.error ?? "Failed to send alert.");
      } else {
        setAlertIsError(false);
        setAlertFeedback("Alert sent.");
        setAlertMessage("");
      }
    } catch {
      setAlertIsError(true);
      setAlertFeedback("Network error.");
    } finally {
      setAlertSending(false);
    }
  }

  async function toggleAdmin() {
    if (!user) return;
    const newVal = !user.is_admin;
    setAdminSaving(true);
    setAdminFeedback("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: newVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminIsError(true);
        setAdminFeedback(data.error ?? "Failed to update admin status.");
      } else {
        setAdminIsError(false);
        setAdminFeedback(`Admin access ${newVal ? "granted" : "revoked"}.`);
        setUser((prev) => prev ? { ...prev, is_admin: newVal } : prev);
      }
    } catch {
      setAdminIsError(true);
      setAdminFeedback("Network error.");
    } finally {
      setAdminSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card p-6 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (fetchError || !user) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-4">
        <Link href="/admin/users" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          ← All Users
        </Link>
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-red-400/70">{fetchError || "User not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/admin/users"
        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors inline-block"
      >
        ← All Users
      </Link>

      {/* User header */}
      <div className="glass-card p-6 flex items-start gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0 flex items-center justify-center">
          {(user as any).avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(user as any).avatar_url}
              alt={user.display_name ?? "Avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl text-muted-foreground/30">⚖</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-xl text-foreground">
              {user.display_name ?? "Unnamed User"}
            </h1>
            {user.is_admin && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/[0.1] border border-gold/25 text-gold/80 uppercase tracking-wider">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground/60 truncate">{user.email ?? "—"}</p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${statusColor(user.account_status)}`}>
              {user.account_status ?? "active"}
            </span>
            {user.subscription_tier && user.subscription_tier !== "free" && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                user.subscription_tier === "high_priestess"
                  ? "bg-violet-500/[0.12] border-violet-400/30 text-violet-300/80"
                  : "bg-gold/[0.1] border-gold/25 text-gold/80"
              }`}>
                {user.subscription_tier === "high_priestess" ? "high priestess" : user.subscription_tier}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground/35">
            Joined{" "}
            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            {user.app_streak ? ` · ${user.app_streak}-day streak` : ""}
            {user.xp_level ? ` · Level ${user.xp_level}` : ""}
          </p>
        </div>
      </div>

      {/* Moderation panel */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Moderation</p>

        <div className="flex flex-wrap gap-2">
          {ACCOUNT_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setModStatus(s.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                modStatus === s.value
                  ? statusColor(s.value) + " font-medium"
                  : "border-white/[0.06] text-muted-foreground hover:border-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {modStatus === "muted" && (
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Muted until</label>
            <input
              type="datetime-local"
              value={mutedUntil}
              onChange={(e) => setMutedUntil(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground text-sm focus:outline-none focus:border-gold/30 transition-colors"
            />
          </div>
        )}

        <button
          onClick={applyStatus}
          disabled={modSaving}
          className="px-5 py-2.5 rounded-full bg-gold/[0.08] border border-gold/20 text-gold/80 text-sm hover:bg-gold/[0.15] transition-all disabled:opacity-40"
        >
          {modSaving ? "Saving…" : "Apply Status"}
        </button>

        {modFeedback && <Feedback msg={modFeedback} isError={modIsError} />}
      </div>

      {/* Subscription panel */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Subscription Tier</p>

        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTier(t.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                tier === t.value
                  ? t.value === "high_priestess"
                    ? "bg-violet-500/[0.12] border-violet-400/30 text-violet-300/80"
                    : t.value === "premium"
                    ? "bg-gold/[0.1] border-gold/25 text-gold/80"
                    : "border-white/10 text-foreground"
                  : "border-white/[0.06] text-muted-foreground hover:border-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={updateTier}
          disabled={tierSaving}
          className="px-5 py-2.5 rounded-full bg-gold/[0.08] border border-gold/20 text-gold/80 text-sm hover:bg-gold/[0.15] transition-all disabled:opacity-40"
        >
          {tierSaving ? "Saving…" : "Update Tier"}
        </button>

        {tierFeedback && <Feedback msg={tierFeedback} isError={tierIsError} />}
      </div>

      {/* Send alert panel */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Send Alert</p>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Alert Type</label>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as AlertType)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground text-sm focus:outline-none focus:border-gold/30 transition-colors"
          >
            {ALERT_TYPES.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Message</label>
          <textarea
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            placeholder="Enter your message to this user…"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground text-sm placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/30 transition-colors resize-none"
          />
        </div>

        <button
          onClick={sendAlert}
          disabled={alertSending}
          className="px-5 py-2.5 rounded-full bg-gold/[0.08] border border-gold/20 text-gold/80 text-sm hover:bg-gold/[0.15] transition-all disabled:opacity-40"
        >
          {alertSending ? "Sending…" : "Send Alert"}
        </button>

        {alertFeedback && <Feedback msg={alertFeedback} isError={alertIsError} />}
      </div>

      {/* Admin toggle panel */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Admin Access</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/80">
              {user.is_admin ? "This user is an admin." : "This user is not an admin."}
            </p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">
              Admins can access this panel and manage other users.
            </p>
          </div>
          <button
            onClick={toggleAdmin}
            disabled={adminSaving}
            className={`px-5 py-2.5 rounded-full text-sm border transition-all disabled:opacity-40 ${
              user.is_admin
                ? "bg-red-500/[0.08] border-red-400/20 text-red-300/80 hover:bg-red-500/[0.14]"
                : "bg-gold/[0.08] border-gold/20 text-gold/80 hover:bg-gold/[0.15]"
            }`}
          >
            {adminSaving
              ? "Saving…"
              : user.is_admin
              ? "Revoke Admin"
              : "Grant Admin"}
          </button>
        </div>

        {adminFeedback && <Feedback msg={adminFeedback} isError={adminIsError} />}
      </div>
    </div>
  );
}
