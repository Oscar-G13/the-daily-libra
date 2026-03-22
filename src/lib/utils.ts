import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export function getZodiacSign(birthDate: string): string {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  return "other"; // This app is Libra-only but we handle edge cases
}

export function isLibra(birthDate: string): boolean {
  return getZodiacSign(birthDate) === "libra";
}

export function getReadingEmoji(category: string): string {
  const map: Record<string, string> = {
    daily: "☀️",
    weekly: "📅",
    monthly: "🌙",
    love: "♥️",
    friendship: "✨",
    career: "⚖️",
    confidence: "👑",
    healing: "🌿",
    decision: "🔮",
    shadow: "🌑",
    beauty: "💎",
    compatibility: "♾️",
    custom: "⭐",
  };
  return map[category] ?? "✦";
}
