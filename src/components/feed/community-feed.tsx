"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface FeedPost {
  id: string;
  post_type: "reading" | "reflection" | "compatibility" | "insight" | "quote";
  content: string;
  mood: string | null;
  like_count: number;
  liked_by_me: boolean;
  is_own: boolean;
  is_anonymous: boolean;
  created_at: string;
  author: {
    display_name: string | null;
    avatar_url: string | null;
    primary_archetype: string | null;
  } | null;
}

const TYPE_ICONS: Record<FeedPost["post_type"], string> = {
  reading: "🔮",
  reflection: "📖",
  compatibility: "🌹",
  insight: "🧠",
  quote: "✦",
};

const TYPE_LABELS: Record<FeedPost["post_type"], string> = {
  reading: "Reading",
  reflection: "Reflection",
  compatibility: "Compatibility",
  insight: "Insight",
  quote: "Quote",
};

const FILTER_TYPES: Array<{ key: string; label: string }> = [
  { key: "", label: "All" },
  { key: "reading", label: "🔮 Readings" },
  { key: "reflection", label: "📖 Reflections" },
  { key: "insight", label: "🧠 Insights" },
  { key: "quote", label: "✦ Quotes" },
];

function PostCard({
  post,
  onLike,
  onDelete,
  isOwn,
}: {
  post: FeedPost;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isOwn: boolean;
}) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);

  function handleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    onLike(post.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {post.is_anonymous || !post.author ? (
          <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm">
            ♎
          </div>
        ) : post.author.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.author.avatar_url}
            alt={post.author.display_name ?? ""}
            className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gold/[0.08] border border-gold/20 flex items-center justify-center text-sm">
            ♎
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/90 truncate">
            {post.is_anonymous ? "Anonymous Libra" : (post.author?.display_name ?? "A Libra")}
          </p>
          {post.author?.primary_archetype && !post.is_anonymous && (
            <p className="text-xs text-muted-foreground/50 truncate capitalize">
              {post.author.primary_archetype.replace(/_/g, " ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground/40">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-muted-foreground/50">
            {TYPE_ICONS[post.post_type]} {TYPE_LABELS[post.post_type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              liked ? "text-gold/70" : "text-muted-foreground/50 hover:text-gold/50"
            )}
          >
            <span>{liked ? "♥" : "♡"}</span>
            <span>{likeCount}</span>
          </button>
          {post.mood && (
            <span className="text-xs text-muted-foreground/40 italic">{post.mood}</span>
          )}
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-xs text-muted-foreground/30 hover:text-red-400/60 transition-colors"
          >
            remove
          </button>
        )}
      </div>
    </motion.div>
  );
}

function NewPostForm({ onPosted }: { onPosted: (post: FeedPost) => void }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<FeedPost["post_type"]>("reflection");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [posting, setPosting] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setPosting(true);
    const res = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, post_type: postType, is_anonymous: isAnonymous }),
    });
    const data = await res.json();
    if (res.ok) {
      onPosted({
        id: data.id,
        post_type: postType,
        content,
        mood: null,
        like_count: 0,
        liked_by_me: false,
        is_own: true,
        is_anonymous: isAnonymous,
        created_at: new Date().toISOString(),
        author: isAnonymous ? null : { display_name: "You", avatar_url: null, primary_archetype: null },
      });
      setContent("");
      setOpen(false);
    }
    setPosting(false);
  }

  return (
    <div className="glass-card p-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
        >
          Share something with the Libra collective...
        </button>
      ) : (
        <div className="space-y-3">
          {/* Type picker */}
          <div className="flex flex-wrap gap-2">
            {(["reflection", "reading", "insight", "quote"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPostType(t)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-all",
                  postType === t
                    ? "bg-gold/[0.08] border-gold/30 text-gold/70"
                    : "border-white/[0.08] text-muted-foreground/50 hover:border-gold/20"
                )}
              >
                {TYPE_ICONS[t]} {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={3}
            autoFocus
            placeholder="What's on your mind, Libra?"
            className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-gold/30 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground/50 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-3 h-3 accent-gold"
              />
              Post anonymously
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/30">{content.length}/500</span>
              <button
                onClick={() => { setOpen(false); setContent(""); }}
                className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors px-2"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!content.trim() || posting}
                className="text-xs px-4 py-1.5 rounded-full bg-gold/[0.1] border border-gold/20 text-gold/70 hover:bg-gold/[0.18] transition-all disabled:opacity-40"
              >
                {posting ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setCursor(null);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams();
    if (filter) params.set("type", filter);
    if (!reset && cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/feed?${params}`);
    const data = await res.json();

    if (res.ok) {
      const newPosts = data.posts ?? [];
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      setHasMore(data.has_more);
      if (newPosts.length > 0) {
        setCursor(newPosts[newPosts.length - 1].created_at);
      }
    }

    setLoading(false);
    setLoadingMore(false);
  }, [filter, cursor]);

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleLike(postId: string) {
    await fetch("/api/feed/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
  }

  async function handleDelete(postId: string) {
    await fetch(`/api/feed?id=${postId}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  function handleNewPost(post: FeedPost) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <div className="space-y-5">
      {/* New post */}
      <NewPostForm onPosted={handleNewPost} />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "text-xs px-3 py-1 rounded-full border transition-all",
              filter === key
                ? "bg-gold/[0.08] border-gold/30 text-gold/70"
                : "border-white/[0.08] text-muted-foreground/50 hover:border-gold/20"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                <div className="h-3 w-32 rounded bg-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded bg-white/[0.04] w-full" />
                <div className="h-3 rounded bg-white/[0.04] w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-3">✦</p>
          <p className="text-sm text-muted-foreground/50">
            No posts yet. Be the first to share something.
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                isOwn={post.is_own}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchPosts(false)}
            disabled={loadingMore}
            className="text-xs text-muted-foreground/50 hover:text-gold/60 transition-colors px-4 py-2"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
