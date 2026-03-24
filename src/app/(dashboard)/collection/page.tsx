import { CollectionGrid } from "@/components/collection/collection-grid";

export const metadata = { title: "Cosmic Collection" };

export default function CollectionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🃏</span>
          <h1 className="font-serif text-display-xs text-foreground">Cosmic Collection</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Cards earned through rituals, milestones, and rare astrological events.
          Some are permanent — others only appear during specific transits.
        </p>
      </div>
      <CollectionGrid />
    </div>
  );
}
