import { CommunityFeed } from "@/components/feed/community-feed";
import { LeaderboardCard } from "@/components/community/leaderboard-card";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-display-xs text-foreground">The Collective</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Libras sharing readings, reflections, and insights in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed — main column */}
        <div className="lg:col-span-2">
          <CommunityFeed />
        </div>

        {/* Leaderboard sidebar */}
        <div className="space-y-4">
          <LeaderboardCard />
        </div>
      </div>
    </div>
  );
}
