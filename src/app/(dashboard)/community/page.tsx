import { CommunityFeed } from "@/components/feed/community-feed";

export const metadata = { title: "Community" };

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-display-xs text-foreground">The Collective</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Libras sharing readings, reflections, and insights in real time.
        </p>
      </div>
      <CommunityFeed />
    </div>
  );
}
