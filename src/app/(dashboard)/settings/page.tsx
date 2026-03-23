"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TONE_LABELS } from "@/types";
import type { ReadingTone } from "@/types";

const TONES: ReadingTone[] = ["gentle", "blunt", "poetic", "practical", "seductive"];
const GOAL_OPTIONS = [
  "love", "career", "confidence", "healing",
  "decision making", "boundaries", "friendships", "creativity",
];
const RELATIONSHIP_OPTIONS = [
  "single", "dating", "in a relationship", "it's complicated",
  "married", "separated", "prefer not to say",
];

function AvatarUpload({
  current,
  onChange,
}: {
  current: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(current);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function upload(file: File) {
    if (file.type.startsWith("video/")) {
      setError("Videos not allowed.");
      return;
    }
    setUploading(true);
    setError("");
    const local = URL.createObjectURL(file);
    setPreview(local);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        onChange(data.avatarUrl);
      } else {
        setError(data.error ?? "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setError("Camera access denied.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        upload(file);
        closeCamera();
      }
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">Profile Photo</p>

      {cameraOpen ? (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-sm">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="px-5 py-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm hover:bg-gold/15 transition-all"
            >
              Capture ✦
            </button>
            <button
              onClick={closeCamera}
              className="px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex items-center gap-4"
        >
          {/* Avatar preview */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0 flex items-center justify-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-muted-foreground/30">⚖</span>
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all disabled:opacity-40"
              >
                {uploading ? "Uploading…" : "Upload photo"}
              </button>
              <button
                onClick={openCamera}
                className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-foreground hover:border-gold/20 transition-all"
              >
                📷 Camera
              </button>
            </div>
            <p className="text-xs text-muted-foreground/40">
              Drag and drop, or click to choose. Any image format.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-400/70">{error}</p>}
    </div>
  );
}

function InviteSection({ referralCode, referralCount }: { referralCode: string; referralCount: number }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://thedailylibra.com";
  const inviteUrl = `${baseUrl}/join/${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Your Invite Link</p>
        {referralCount > 0 && (
          <span className="text-xs text-gold/60 bg-gold/[0.08] border border-gold/15 px-2 py-0.5 rounded-full">
            {referralCount} {referralCount === 1 ? "person" : "people"} invited
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={inviteUrl}
          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-muted-foreground/70 outline-none font-mono"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2.5 rounded-lg border border-white/[0.08] text-sm text-muted-foreground hover:text-gold/80 hover:border-gold/20 transition-all"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-muted-foreground/40">
        Anyone who signs up through your link appears in your Invited network.
      </p>
    </div>
  );
}

function PushNotificationSection() {
  const [status, setStatus] = useState<"idle" | "subscribed" | "denied" | "loading">("idle");

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") setStatus("subscribed");
    else if (Notification.permission === "denied") setStatus("denied");
  }, []);

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setStatus("subscribed"); // Still mark as subscribed UI-wise
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });
      setStatus("subscribed");
    } catch {
      setStatus("denied");
    }
  }

  async function unsubscribe() {
    await fetch("/api/push/subscribe", { method: "DELETE" });
    setStatus("idle");
  }

  return (
    <div className="glass-card p-6 space-y-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">Cosmic Notifications</p>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-foreground/80">Astrological event alerts</p>
          <p className="text-xs text-muted-foreground/50 leading-relaxed">
            Moon phase updates, retrograde warnings, and daily reading reminders — based on your chart.
          </p>
        </div>
        {status === "subscribed" ? (
          <button
            onClick={unsubscribe}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-white/[0.06] text-xs text-muted-foreground hover:text-foreground transition-all"
          >
            Disable
          </button>
        ) : status === "denied" ? (
          <span className="shrink-0 text-xs text-muted-foreground/40">Blocked in browser</span>
        ) : (
          <button
            onClick={subscribe}
            disabled={status === "loading"}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-gold/[0.08] border border-gold/20 text-xs text-gold/80 hover:bg-gold/15 transition-all disabled:opacity-50"
          >
            {status === "loading" ? "…" : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [tone, setTone] = useState<ReadingTone>("gentle");
  const [relationshipStatus, setRelationshipStatus] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [profilePublic, setProfilePublic] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [tier, setTier] = useState("free");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("users")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select("display_name, pronouns, tone_preference, relationship_status, goals, subscription_tier, avatar_url, profile_bio, profile_public, referral_code, referral_count" as any)
      .eq("id", user.id)
      .single();

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = data as any;
      setDisplayName(d.display_name ?? "");
      setPronouns(d.pronouns ?? "");
      setBio(d.profile_bio ?? "");
      setTone((d.tone_preference as ReadingTone) ?? "gentle");
      setRelationshipStatus(d.relationship_status ?? "");
      setGoals(d.goals ?? []);
      setTier(d.subscription_tier ?? "free");
      setAvatarUrl(d.avatar_url ?? null);
      setProfilePublic(d.profile_public ?? false);
      setReferralCode(d.referral_code ?? "");
      setReferralCount(d.referral_count ?? 0);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function toggleGoal(goal: string) {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          pronouns,
          profile_bio: bio,
          tone_preference: tone,
          relationship_status: relationshipStatus,
          goals,
          profile_public: profilePublic,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-serif text-display-xs text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your profile and preferences.</p>
      </motion.div>

      {/* Avatar */}
      <div className="glass-card p-6">
        <AvatarUpload current={avatarUrl} onChange={setAvatarUrl} />
      </div>

      {/* Identity */}
      <div className="glass-card p-6 space-y-5">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Identity</p>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Pronouns</label>
          <input
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="e.g. she/her, they/them"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A few words about you…"
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Relationship Status</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setRelationshipStatus(opt === relationshipStatus ? "" : opt)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                  relationshipStatus === opt
                    ? "bg-gold/[0.08] border-gold/25 text-gold-200"
                    : "border-white/[0.06] text-muted-foreground hover:border-gold/15"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">What I&apos;m Working On</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                goals.includes(goal)
                  ? "bg-gold/[0.08] border-gold/25 text-gold-200"
                  : "border-white/[0.06] text-muted-foreground hover:border-gold/15"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Tone */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Default Reading Tone</p>
          {tier !== "premium" && (
            <span className="text-xs text-gold/50 bg-gold/[0.06] border border-gold/15 px-2 py-0.5 rounded-full">
              Premium unlocks all tones
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {TONES.map((t) => {
            const locked = tier !== "premium" && t !== "gentle";
            return (
              <button
                key={t}
                onClick={() => !locked && setTone(t)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm flex items-center justify-between ${
                  tone === t && !locked
                    ? "border-gold/40 bg-gold/5 text-foreground"
                    : locked
                    ? "border-white/[0.04] text-muted-foreground/30 cursor-not-allowed"
                    : "border-white/[0.06] text-muted-foreground hover:border-white/10"
                }`}
              >
                {TONE_LABELS[t]}
                {locked && <span className="text-xs text-gold/40">PRO</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Public profile toggle */}
      <div className="glass-card p-6 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Visibility</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground/80">Public profile</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              Allow others to view your profile via your invite link.
            </p>
          </div>
          <button
            onClick={() => setProfilePublic(!profilePublic)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              profilePublic ? "bg-gold/40" : "bg-white/[0.08]"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                profilePublic ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saved ? "Saved ✓" : saving ? "Saving…" : "Save Changes"}
      </button>

      {/* Invite link */}
      {referralCode && (
        <InviteSection referralCode={referralCode} referralCount={referralCount} />
      )}

      {/* Push notifications */}
      <PushNotificationSection />
    </div>
  );
}
