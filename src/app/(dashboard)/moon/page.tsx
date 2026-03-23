import { MoonCalendar } from "@/components/moon/moon-calendar";

export default function MoonPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          Lunar Planning
        </p>
        <h1 className="font-serif text-display-sm text-foreground">Moon Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          30 days of lunar energy — plan your rituals, decisions, and rest around the moon&apos;s
          rhythm.
        </p>
      </div>
      <MoonCalendar />
    </div>
  );
}
