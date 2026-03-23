"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ClientCardProps {
  connection: {
    id: string;
    client_name: string | null;
    client_email: string;
    status: "pending" | "active" | "archived";
    invite_sent_at: string | null;
    accepted_at: string | null;
  };
  readingCount: number;
  unreadCount: number;
  lastReadingDate: string | null;
}

export function ClientCard({
  connection,
  readingCount,
  unreadCount,
  lastReadingDate,
}: ClientCardProps) {
  const name = connection.client_name ?? connection.client_email.split("@")[0];
  const isPending = connection.status === "pending";

  return (
    <Link href={`/guide/clients/${connection.id}`}>
      <div
        className={cn(
          "glass-card p-5 hover:border-gold/20 transition-all group cursor-pointer",
          isPending && "opacity-70"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2",
                isPending
                  ? "bg-white/[0.04] border-white/[0.08]"
                  : "bg-gold/[0.08] border-gold/20"
              )}
            >
              {isPending ? "✉" : "♎"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                {name}
              </p>
              <p className="text-xs text-muted-foreground/50 truncate max-w-[180px]">
                {connection.client_email}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full border shrink-0",
              isPending
                ? "bg-white/[0.04] border-white/[0.08] text-muted-foreground/50"
                : "bg-gold/[0.06] border-gold/15 text-gold/60"
            )}
          >
            {isPending ? "Pending" : "Active"}
          </span>
        </div>

        {!isPending && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.04]">
            <div className="text-center">
              <p className="text-xs text-muted-foreground/40">Readings</p>
              <p className="text-sm text-foreground/70 font-medium">{readingCount}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground/40">Unread</p>
              <p
                className={cn(
                  "text-sm font-medium",
                  unreadCount > 0 ? "text-gold/70" : "text-foreground/40"
                )}
              >
                {unreadCount}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground/40">Last sent</p>
              <p className="text-xs text-foreground/50">
                {lastReadingDate
                  ? formatDistanceToNow(new Date(lastReadingDate), { addSuffix: true })
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {isPending && connection.invite_sent_at && (
          <p className="text-xs text-muted-foreground/40 pt-2 border-t border-white/[0.04]">
            Invited{" "}
            {formatDistanceToNow(new Date(connection.invite_sent_at), { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
