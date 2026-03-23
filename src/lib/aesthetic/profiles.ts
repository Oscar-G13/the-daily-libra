import type { AestheticStyle } from "@/types";

// ─── Style Definitions ────────────────────────────────────────────────────────

export interface AestheticProfile {
  key: AestheticStyle;
  name: string;
  tagline: string;
  description: string;
  traits: string[];
  palette: string; // text description of color palette
  icon: string;
  accentClass: string; // tailwind border/text hint for accent
}

export const AESTHETIC_PROFILES: Record<AestheticStyle, AestheticProfile> = {
  soft_luxe: {
    key: "soft_luxe",
    name: "Soft Luxe",
    tagline: "Beauty that asks to be touched.",
    description:
      "You live in warmth. Your aesthetic is rich without being loud — cashmere over chrome, candlelight over neon, the kind of luxury that wraps around you. You are drawn to texture, softness, and the feeling of being held by your environment. Your taste is feminine without apology, romantic without naïveté.",
    traits: ["warm", "tactile", "romantic", "indulgent", "golden", "draped"],
    palette: "Dusty rose, champagne, warm ivory, blush bronze, soft gold",
    icon: "🕯",
    accentClass: "border-rose-300/30 text-rose-200",
  },
  dark_romance: {
    key: "dark_romance",
    name: "Dark Romance",
    tagline: "There is beauty in everything that unsettles.",
    description:
      "You are not afraid of depth or shadow. Your aesthetic lives in moody spaces, deep florals, candlelight in dim rooms, and clothing that makes a statement without asking for attention. You understand that true elegance has an edge. You are drawn to drama, mystery, and the kind of beauty that lingers long after you leave the room.",
    traits: ["moody", "dramatic", "mysterious", "intense", "velvet", "layered"],
    palette: "Deep burgundy, midnight blue, forest green, black, smoky plum",
    icon: "🌑",
    accentClass: "border-purple-500/30 text-purple-200",
  },
  celestial_editorial: {
    key: "celestial_editorial",
    name: "Celestial Editorial",
    tagline: "You exist somewhere between the real and the cosmic.",
    description:
      "Your taste is otherworldly — high fashion meets astral plane. You are drawn to iridescence, unexpected silhouettes, art that makes people stop and think, and environments that feel like concept shoots. Beauty, for you, is conceptual. You wear looks. You do not follow trends — you exist ahead of them.",
    traits: [
      "editorial",
      "avant-garde",
      "cosmic",
      "iridescent",
      "unexpected",
      "narrative",
    ],
    palette: "Iridescent silver, deep indigo, violet, midnight, cool white",
    icon: "✦",
    accentClass: "border-violet-400/30 text-violet-200",
  },
  clean_goddess: {
    key: "clean_goddess",
    name: "Clean Goddess",
    tagline: "Purity is its own kind of power.",
    description:
      "Your aesthetic is built on light and clarity. You are drawn to clean lines, open space, natural textures, and beauty that looks effortless. Your spaces are curated but never cluttered. Your look is dewy and fresh, never overdone. You believe in the power of simplicity done beautifully — and you always look like you have your life together.",
    traits: ["airy", "minimal", "natural", "radiant", "effortless", "pristine"],
    palette: "White, cream, warm beige, soft sage, pale blush, natural linen",
    icon: "🌿",
    accentClass: "border-emerald-300/30 text-emerald-100",
  },
  velvet_minimalism: {
    key: "velvet_minimalism",
    name: "Velvet Minimalism",
    tagline: "Less. But it must be perfect.",
    description:
      "You have edited your way to something pure. Your aesthetic is minimal but never cold — every piece is chosen with intention, every surface earns its place. You prefer depth to decoration, restraint to spectacle. Your wardrobe is dark, your home is calm, and your taste is the kind that takes decades to cultivate. You are the definition of understated authority.",
    traits: [
      "restrained",
      "intentional",
      "rich",
      "quiet",
      "architectural",
      "considered",
    ],
    palette: "Charcoal, muted plum, deep taupe, warm black, midnight grey",
    icon: "◼",
    accentClass: "border-zinc-400/30 text-zinc-200",
  },
  modern_venus: {
    key: "modern_venus",
    name: "Modern Venus",
    tagline: "You are the product. The ritual. The whole vision.",
    description:
      "Your aesthetic is contemporary beauty elevated to lifestyle. You understand that grooming is glamour, that a skincare ritual is sacred, and that looking polished is a form of self-respect. You invest in what you put on your face and your body. Your taste is warm, modern, and feminine — not trend-chasing, but always current. You are your own muse.",
    traits: ["polished", "beauty-forward", "warm", "modern", "curated", "luminous"],
    palette: "Nude, warm blush, rose gold, ivory, caramel, warm white",
    icon: "♀",
    accentClass: "border-amber-300/30 text-amber-100",
  },
};

export const AESTHETIC_STYLE_LABELS: Record<AestheticStyle, string> = {
  soft_luxe: "Soft Luxe",
  dark_romance: "Dark Romance",
  celestial_editorial: "Celestial Editorial",
  clean_goddess: "Clean Goddess",
  velvet_minimalism: "Velvet Minimalism",
  modern_venus: "Modern Venus",
};

// ─── Quiz Questions ───────────────────────────────────────────────────────────

export interface QuizChoice {
  text: string;
  subtext: string;
  style: AestheticStyle;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
}

export const AESTHETIC_QUIZ: QuizQuestion[] = [
  {
    id: "space",
    prompt: "Your ideal space feels like...",
    choices: [
      {
        text: "Warm candlelight, plush textures, soft gold",
        subtext: "A room that feels like a gentle embrace",
        style: "soft_luxe",
      },
      {
        text: "Dim lighting, dark florals, deep velvet",
        subtext: "Moody and intimate — you feel most alive after dark",
        style: "dark_romance",
      },
      {
        text: "High ceilings, cosmic art, editorial prints",
        subtext: "Conceptual. A gallery crossed with a dream",
        style: "celestial_editorial",
      },
      {
        text: "Bright, airy, marble surfaces, fresh flowers",
        subtext: "Clean and radiant — beauty in its simplest form",
        style: "clean_goddess",
      },
      {
        text: "Minimal furniture, one statement piece, absolute calm",
        subtext: "Nothing unnecessary. Everything intentional",
        style: "velvet_minimalism",
      },
      {
        text: "A beauty counter as altar, curated warmth",
        subtext: "Your space is a ritual. You are the centerpiece",
        style: "modern_venus",
      },
    ],
  },
  {
    id: "palette",
    prompt: "Your instinctive color palette...",
    choices: [
      {
        text: "Dusty rose, champagne, warm ivory",
        subtext: "Warmth, softness, golden hour",
        style: "soft_luxe",
      },
      {
        text: "Deep burgundy, midnight blue, forest green",
        subtext: "Rich, saturated, complex",
        style: "dark_romance",
      },
      {
        text: "Iridescent silver, violet, cosmic indigo",
        subtext: "Colors that shift depending on the light",
        style: "celestial_editorial",
      },
      {
        text: "White, cream, soft sage, pale blush",
        subtext: "Clarity and radiance. Nothing distracting",
        style: "clean_goddess",
      },
      {
        text: "Charcoal, deep taupe, warm black",
        subtext: "Neutrals chosen with obsessive precision",
        style: "velvet_minimalism",
      },
      {
        text: "Nude, rose gold, warm blush, caramel",
        subtext: "Skin-toned, glowing, modern warmth",
        style: "modern_venus",
      },
    ],
  },
  {
    id: "evening",
    prompt: "A perfect evening, just for you...",
    choices: [
      {
        text: "Candles, silk robe, soft music, wine, bath",
        subtext: "Slow. Indulgent. Everything soft",
        style: "soft_luxe",
      },
      {
        text: "A dim bar, an intriguing stranger, late night intensity",
        subtext: "Something electric in the darkness",
        style: "dark_romance",
      },
      {
        text: "Rooftop, city lights, one deep conversation",
        subtext: "Somewhere between worlds",
        style: "celestial_editorial",
      },
      {
        text: "A long bath, fresh flowers, clean quiet space",
        subtext: "Pure restoration. Radiance replenished",
        style: "clean_goddess",
      },
      {
        text: "Alone in a perfectly curated space. Reading. Silence",
        subtext: "The luxury of absolute stillness",
        style: "velvet_minimalism",
      },
      {
        text: "Skincare ritual, mirror time, curated self-care",
        subtext: "You as the event",
        style: "modern_venus",
      },
    ],
  },
  {
    id: "dressing",
    prompt: "Getting dressed, you reach for...",
    choices: [
      {
        text: "Layered textures, draped silhouettes, something soft",
        subtext: "You want to feel touched by your own clothes",
        style: "soft_luxe",
      },
      {
        text: "All black with one deliberate, unexpected element",
        subtext: "Monochrome as a form of armor",
        style: "dark_romance",
      },
      {
        text: "A statement piece that tells a story",
        subtext: "You wear things that make people ask questions",
        style: "celestial_editorial",
      },
      {
        text: "Clean lines, fitted basics — effortless and precise",
        subtext: "Style as clarity",
        style: "clean_goddess",
      },
      {
        text: "One perfect piece, everything else stripped away",
        subtext: "The most edited version of yourself",
        style: "velvet_minimalism",
      },
      {
        text: "Polished, skin-care first — look as beauty ritual",
        subtext: "The getting ready is part of the art",
        style: "modern_venus",
      },
    ],
  },
  {
    id: "beauty",
    prompt: "Your relationship with beauty is...",
    choices: [
      {
        text: "Ritual. Fragrance, soft lighting, the whole experience",
        subtext: "Beauty is devotion",
        style: "soft_luxe",
      },
      {
        text: "Edge. Shadow, dark lip, something mysterious",
        subtext: "Beauty with teeth",
        style: "dark_romance",
      },
      {
        text: "Otherworldly. Ethereal, avant-garde, conceptual",
        subtext: "You look like you arrived from somewhere else",
        style: "celestial_editorial",
      },
      {
        text: "Natural. Dewy, effortless, nothing overdone",
        subtext: "The most beautiful version of bare",
        style: "clean_goddess",
      },
      {
        text: "Refined. Quality over quantity, signature over trend",
        subtext: "The minimum that says the maximum",
        style: "velvet_minimalism",
      },
      {
        text: "Investment. Skincare, signature scent, modern glow",
        subtext: "Beauty as identity architecture",
        style: "modern_venus",
      },
    ],
  },
  {
    id: "resonance",
    prompt: "The phrase that lands in your chest...",
    choices: [
      {
        text: '"Soft is its own kind of strength."',
        subtext: "",
        style: "soft_luxe",
      },
      {
        text: '"There is beauty in everything that unsettles."',
        subtext: "",
        style: "dark_romance",
      },
      {
        text: '"I exist between the real and the cosmic."',
        subtext: "",
        style: "celestial_editorial",
      },
      {
        text: '"Pure light needs no explanation."',
        subtext: "",
        style: "clean_goddess",
      },
      {
        text: '"Less. But it must be perfect."',
        subtext: "",
        style: "velvet_minimalism",
      },
      {
        text: '"I am the ritual. I am the product."',
        subtext: "",
        style: "modern_venus",
      },
    ],
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

export function scoreAestheticQuiz(
  answers: Record<string, AestheticStyle>
): AestheticStyle {
  const tally: Record<AestheticStyle, number> = {
    soft_luxe: 0,
    dark_romance: 0,
    celestial_editorial: 0,
    clean_goddess: 0,
    velvet_minimalism: 0,
    modern_venus: 0,
  };

  for (const style of Object.values(answers)) {
    tally[style] = (tally[style] ?? 0) + 1;
  }

  let top: AestheticStyle = "soft_luxe";
  let max = -1;
  for (const [style, count] of Object.entries(tally) as [AestheticStyle, number][]) {
    if (count > max) {
      max = count;
      top = style;
    }
  }

  return top;
}
