// ─────────────────────────────────────────────────────────────────────────────
//  The Daily Libra — Supabase Database Types
//  Auto-generate via: npm run db:types
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          pronouns: string | null;
          subscription_tier: "free" | "premium";
          tone_preference: "gentle" | "blunt" | "poetic" | "practical" | "seductive" | null;
          relationship_status: string | null;
          goals: string[];
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          pronouns?: string | null;
          subscription_tier?: "free" | "premium";
          tone_preference?: "gentle" | "blunt" | "poetic" | "practical" | "seductive" | null;
          relationship_status?: string | null;
          goals?: string[];
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          pronouns?: string | null;
          subscription_tier?: "free" | "premium";
          tone_preference?: "gentle" | "blunt" | "poetic" | "practical" | "seductive" | null;
          relationship_status?: string | null;
          goals?: string[];
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      birth_profiles: {
        Row: {
          id: string;
          user_id: string;
          birth_date: string;
          birth_time: string | null;
          birth_city: string;
          birth_country: string;
          timezone: string;
          latitude: number | null;
          longitude: number | null;
          natal_chart_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          birth_date: string;
          birth_time?: string | null;
          birth_city: string;
          birth_country: string;
          timezone: string;
          latitude?: number | null;
          longitude?: number | null;
          natal_chart_json?: Json | null;
        };
        Update: {
          birth_time?: string | null;
          birth_city?: string;
          birth_country?: string;
          timezone?: string;
          latitude?: number | null;
          longitude?: number | null;
          natal_chart_json?: Json | null;
          updated_at?: string;
        };
      };
      libra_profiles: {
        Row: {
          id: string;
          user_id: string;
          primary_archetype: string;
          secondary_modifier: string | null;
          aesthetic_style: string | null;
          relationship_style: string | null;
          conflict_style: string | null;
          decision_style: string | null;
          beauty_affinity: string | null;
          emotional_pattern_summary: string | null;
          ai_memory_summary: string | null;
          quiz_scores: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          primary_archetype: string;
          secondary_modifier?: string | null;
          aesthetic_style?: string | null;
          relationship_style?: string | null;
          conflict_style?: string | null;
          decision_style?: string | null;
          beauty_affinity?: string | null;
          emotional_pattern_summary?: string | null;
          ai_memory_summary?: string | null;
          quiz_scores?: Json | null;
        };
        Update: {
          primary_archetype?: string;
          secondary_modifier?: string | null;
          aesthetic_style?: string | null;
          relationship_style?: string | null;
          conflict_style?: string | null;
          decision_style?: string | null;
          beauty_affinity?: string | null;
          emotional_pattern_summary?: string | null;
          ai_memory_summary?: string | null;
          quiz_scores?: Json | null;
          updated_at?: string;
        };
      };
      daily_readings: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          tone: string;
          prompt_context_json: Json | null;
          output_text: string;
          reading_date: string;
          saved_to_journal: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category?: string;
          tone?: string;
          prompt_context_json?: Json | null;
          output_text: string;
          reading_date?: string;
          saved_to_journal?: boolean;
        };
        Update: {
          saved_to_journal?: boolean;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          body: string;
          mood_tag: string | null;
          mood_score: number | null;
          linked_reading_id: string | null;
          ai_summary: string | null;
          entry_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          body: string;
          mood_tag?: string | null;
          mood_score?: number | null;
          linked_reading_id?: string | null;
          ai_summary?: string | null;
          entry_date?: string;
        };
        Update: {
          title?: string | null;
          body?: string;
          mood_tag?: string | null;
          mood_score?: number | null;
          ai_summary?: string | null;
          updated_at?: string;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          mood_score: number | null;
          confidence_score: number | null;
          social_energy_score: number | null;
          romantic_energy_score: number | null;
          stress_score: number | null;
          self_worth_score: number | null;
          notes: string | null;
          log_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_score?: number | null;
          confidence_score?: number | null;
          social_energy_score?: number | null;
          romantic_energy_score?: number | null;
          stress_score?: number | null;
          self_worth_score?: number | null;
          notes?: string | null;
          log_date?: string;
        };
        Update: {
          mood_score?: number | null;
          confidence_score?: number | null;
          social_energy_score?: number | null;
          romantic_energy_score?: number | null;
          stress_score?: number | null;
          self_worth_score?: number | null;
          notes?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          provider: string;
          status: string;
          plan_name: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          provider?: string;
          status?: string;
          plan_name?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          plan_name?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: "free" | "premium";
      reading_category:
        | "daily"
        | "weekly"
        | "monthly"
        | "love"
        | "friendship"
        | "career"
        | "confidence"
        | "healing"
        | "decision"
        | "shadow"
        | "beauty"
        | "compatibility"
        | "custom";
      reading_tone: "gentle" | "blunt" | "poetic" | "practical" | "seductive";
    };
  };
}
