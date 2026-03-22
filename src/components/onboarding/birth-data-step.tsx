"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BirthData {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

interface BirthDataStepProps {
  onNext: (data: BirthData) => void;
}

export function BirthDataStep({ onNext }: BirthDataStepProps) {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Geocode the city to get lat/long and timezone
      // In production, use a geocoding API (Google Maps, Nominatim, etc.)
      // For now, use a simplified approach
      const geocodeRes = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(birthCity)}&country=${encodeURIComponent(birthCountry)}&format=json&limit=1`
      );
      const geocodeData = await geocodeRes.json();

      let latitude = 40.7128;
      let longitude = -74.006;
      let timezone = "America/New_York";

      if (geocodeData.length > 0) {
        latitude = parseFloat(geocodeData[0].lat);
        longitude = parseFloat(geocodeData[0].lon);
      }

      // Get timezone from coordinates
      try {
        const tzRes = await fetch(
          `https://timezonefinder.michaelwillis.de/api/v1/?lat=${latitude}&lng=${longitude}`
        );
        if (tzRes.ok) {
          const tzData = await tzRes.json();
          timezone = tzData.timezone ?? timezone;
        }
      } catch {
        // Fall back to estimation based on longitude
        const offset = Math.round(longitude / 15);
        timezone = `Etc/GMT${offset >= 0 ? "+" : ""}${offset}`;
      }

      onNext({ birthDate, birthTime, birthCity, birthCountry, timezone, latitude, longitude });
    } catch {
      setError("Could not geocode your birth city. Please check the spelling.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-widest text-gold/60 mb-2">Step 1 of 4</p>
          <h2 className="font-serif text-display-sm text-foreground mb-2">Your birth data.</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            This powers your natal chart — Venus, Moon, Rising, and every placement that shapes how you love and move through the world.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Birth Date <span className="text-gold/60">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Birth Time{" "}
                <span className="text-muted-foreground/50 normal-case">(optional — but makes your reading sharper)</span>
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground focus:outline-none focus:border-gold/40 transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Birth City <span className="text-gold/60">*</span>
                </label>
                <input
                  type="text"
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  required
                  placeholder="e.g. Los Angeles"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/40 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Country <span className="text-gold/60">*</span>
                </label>
                <input
                  type="text"
                  value={birthCountry}
                  onChange={(e) => setBirthCountry(e.target.value)}
                  required
                  placeholder="e.g. USA"
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-gold/40 transition-colors text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-gradient-to-r from-gold-200 to-bronze text-obsidian font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              {loading ? "Calculating your chart..." : "Continue →"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
