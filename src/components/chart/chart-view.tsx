import type { NatalChart } from "@/types";

const PLANET_MEANINGS: Record<string, { in: (sign: string) => string }> = {
  Venus: {
    in: (sign) => {
      const meanings: Record<string, string> = {
        Libra:
          "Venus in Libra — your natural home. You love through beauty, reciprocity, and refined connection. Partnership is central to who you are.",
        Scorpio:
          "Venus in Scorpio — you love with intensity, depth, and full emotional commitment. Surface-level connections feel hollow to you.",
        Leo: "Venus in Leo — love is your stage. You want to be adored, seen, and chosen. You give generously but need devotion in return.",
        Taurus:
          "Venus in Taurus — love is sensory, slow, and loyal. You need security and physical presence. You're not a fan of instability.",
        Pisces:
          "Venus in Pisces — you fall in love with ideals, souls, and art. Deeply romantic, often to a fault. Boundaries matter here.",
        Gemini:
          "Venus in Gemini — you fall for minds. Witty, curious, and emotionally playful. You need variety and stimulation to stay engaged.",
        Cancer:
          "Venus in Cancer — you nurture deeply and love through care. Home, loyalty, and emotional safety are your love language.",
        Virgo:
          "Venus in Virgo — love is shown through acts of service, precision, and devotion. You notice everything and give with care.",
        Capricorn:
          "Venus in Capricorn — love is an investment. You're selective, loyal, and drawn to stability, ambition, and substance.",
        Aquarius:
          "Venus in Aquarius — you love unconventionally. Friendship is the foundation. You need intellectual freedom and authenticity.",
        Sagittarius:
          "Venus in Sagittarius — love is adventure. You fall for experiences, philosophy, and people who expand your world.",
        Aries:
          "Venus in Aries — love is electric and immediate. You pursue boldly and love passionately — but can lose interest if the spark dims.",
      };
      return meanings[sign] ?? `Venus in ${sign} — your love style is shaped by ${sign} energy.`;
    },
  },
  Moon: {
    in: (sign) => {
      const meanings: Record<string, string> = {
        Scorpio:
          "Moon in Scorpio — your emotions run deep, private, and intense. You feel everything fully but rarely show it until trust is earned.",
        Libra:
          "Moon in Libra — you need emotional harmony. Conflict disturbs your peace deeply. You thrive when relationships feel balanced.",
        Cancer:
          "Moon in Cancer — deeply sensitive, nurturing, and home-oriented. Your emotions are fluid and require soft landings.",
        Pisces:
          "Moon in Pisces — emotionally empathic to a degree that can blur boundaries. You absorb others' feelings effortlessly.",
        Capricorn:
          "Moon in Capricorn — emotionally reserved and self-sufficient. You process privately and need to feel in control of your inner life.",
        Aquarius:
          "Moon in Aquarius — emotionally detached but deeply caring. You intellectualize feelings before you feel them.",
        Virgo:
          "Moon in Virgo — you process through analysis and order. Anxiety shows up when things feel out of control or imprecise.",
        Taurus:
          "Moon in Taurus — grounded, comfort-seeking, and steady. You need sensory stability and dislike sudden emotional disruption.",
        Aries:
          "Moon in Aries — emotionally reactive, honest, and quick to reset. You feel boldly and sometimes impulsively.",
        Gemini:
          "Moon in Gemini — mentally emotional. You process through talking, writing, and shifting perspectives quickly.",
        Leo: "Moon in Leo — emotionally expressive, warm, and proud. Recognition and appreciation matter deeply to your emotional world.",
        Sagittarius:
          "Moon in Sagittarius — emotionally free-spirited. You need space, adventure, and optimism to feel good.",
      };
      return (
        meanings[sign] ?? `Moon in ${sign} — your emotional world is colored by ${sign} energy.`
      );
    },
  },
};

interface ChartViewProps {
  chart: NatalChart | null;
  birthCity?: string;
  birthDate?: string;
  birthTime?: string | null;
}

export function ChartView({
  chart,
  birthCity: _birthCity,
  birthDate: _birthDate,
  birthTime,
}: ChartViewProps) {
  if (!chart) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-muted-foreground">No chart data available.</p>
      </div>
    );
  }

  const keyPlanets = [
    { name: "Sun", data: chart.sun, label: "Core identity & life force" },
    { name: "Moon", data: chart.moon, label: "Emotions & inner world" },
    { name: "Mercury", data: chart.mercury, label: "Mind & communication" },
    { name: "Venus", data: chart.venus, label: "Love, beauty & values" },
    { name: "Mars", data: chart.mars, label: "Drive, desire & conflict style" },
    { name: "Jupiter", data: chart.jupiter, label: "Growth & expansion" },
    { name: "Saturn", data: chart.saturn, label: "Discipline & lessons" },
  ];

  const rising = chart.ascendant;
  const mc = chart.midheaven;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="glass-card p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Chart Overview
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-gold/5 border border-gold/10">
            <p className="text-xs text-gold/60 mb-1">Sun</p>
            <p className="font-serif text-base text-gold-gradient">{chart.sun?.sign}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs text-muted-foreground mb-1">Moon</p>
            <p className="font-serif text-base text-foreground">{chart.moon?.sign}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs text-muted-foreground mb-1">Rising</p>
            <p className="font-serif text-base text-foreground">{rising?.sign}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-xs text-muted-foreground mb-1">Venus</p>
            <p className="font-serif text-base text-foreground">{chart.venus?.sign}</p>
          </div>
        </div>
      </div>

      {/* Venus deep dive */}
      {chart.venus?.sign && (
        <div className="glass-card p-6 border-gold/10">
          <p className="text-xs text-gold/60 uppercase tracking-widest mb-3">♀ Venus Placement</p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {PLANET_MEANINGS.Venus.in(chart.venus.sign)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">House {chart.venus.house}</p>
        </div>
      )}

      {/* Moon deep dive */}
      {chart.moon?.sign && (
        <div className="glass-card p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
            🌙 Moon Placement
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {PLANET_MEANINGS.Moon.in(chart.moon.sign)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">House {chart.moon.house}</p>
        </div>
      )}

      {/* Full planet table */}
      <div className="glass-card p-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
          All Placements
        </p>
        <div className="space-y-3">
          {keyPlanets.map(({ name, data }) => (
            <div
              key={name}
              className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
            >
              <div>
                <p className="text-sm text-foreground/80">{name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground font-medium">{data?.sign ?? "—"}</p>
                {data?.house && (
                  <p className="text-xs text-muted-foreground">
                    H{data.house} · {Math.round(data.degree)}°
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <p className="text-sm text-foreground/80">Ascendant (Rising)</p>
            <p className="text-sm text-foreground font-medium">{rising?.sign ?? "—"}</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-foreground/80">Midheaven (MC)</p>
            <p className="text-sm text-foreground font-medium">{mc?.sign ?? "—"}</p>
          </div>
        </div>
      </div>

      {!birthTime && (
        <div className="glass-card p-4 border-gold/10">
          <p className="text-xs text-gold/60">
            ✦ No birth time provided — Rising sign and house positions are approximate. Add your
            birth time in settings for a more accurate chart.
          </p>
        </div>
      )}
    </div>
  );
}
