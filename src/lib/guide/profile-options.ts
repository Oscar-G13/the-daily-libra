export const GUIDE_PROFILE_THEME_OPTIONS = [
  {
    value: "gold",
    label: "Midnight Gold",
    description: "Dark, polished, and luxe with warm gold accents.",
  },
  {
    value: "plum",
    label: "Velvet Plum",
    description: "A richer studio look with violet depth and softer contrast.",
  },
  {
    value: "rose",
    label: "Rose Ember",
    description: "Warm bronze and rose tones for a softer, romantic storefront.",
  },
] as const;

export const GUIDE_PROFILE_LAYOUT_OPTIONS = [
  {
    value: "editorial",
    label: "Editorial",
    description: "Large story-first layout with a refined sales panel.",
  },
  {
    value: "spotlight",
    label: "Spotlight",
    description: "Centered hero presentation for a polished landing page feel.",
  },
  {
    value: "portrait",
    label: "Portrait",
    description: "Profile-forward layout that puts the guide card first.",
  },
] as const;

export type GuideProfileTheme = (typeof GUIDE_PROFILE_THEME_OPTIONS)[number]["value"];
export type GuideProfileLayout = (typeof GUIDE_PROFILE_LAYOUT_OPTIONS)[number]["value"];

export const DEFAULT_GUIDE_PROFILE_THEME: GuideProfileTheme = "gold";
export const DEFAULT_GUIDE_PROFILE_LAYOUT: GuideProfileLayout = "editorial";

export function normalizeGuideProfileTheme(value: string | null | undefined): GuideProfileTheme {
  return GUIDE_PROFILE_THEME_OPTIONS.some((option) => option.value === value)
    ? (value as GuideProfileTheme)
    : DEFAULT_GUIDE_PROFILE_THEME;
}

export function normalizeGuideProfileLayout(value: string | null | undefined): GuideProfileLayout {
  return GUIDE_PROFILE_LAYOUT_OPTIONS.some((option) => option.value === value)
    ? (value as GuideProfileLayout)
    : DEFAULT_GUIDE_PROFILE_LAYOUT;
}
