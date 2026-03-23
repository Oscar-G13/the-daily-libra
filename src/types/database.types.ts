export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      ai_memory: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          memory_type: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          memory_type: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          memory_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_memory_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_personalization_memory: {
        Row: {
          content_preferences: Json | null;
          id: string;
          profile_snapshot: Json | null;
          system_prompt_fragment: string | null;
          tone_rules: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content_preferences?: Json | null;
          id?: string;
          profile_snapshot?: Json | null;
          system_prompt_fragment?: string | null;
          tone_rules?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content_preferences?: Json | null;
          id?: string;
          profile_snapshot?: Json | null;
          system_prompt_fragment?: string | null;
          tone_rules?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_personalization_memory_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_options: {
        Row: {
          id: string;
          label: string;
          metadata: Json | null;
          numeric_value: number;
          question_id: string;
          sort_order: number;
          value_key: string;
        };
        Insert: {
          id?: string;
          label: string;
          metadata?: Json | null;
          numeric_value?: number;
          question_id: string;
          sort_order: number;
          value_key: string;
        };
        Update: {
          id?: string;
          label?: string;
          metadata?: Json | null;
          numeric_value?: number;
          question_id?: string;
          sort_order?: number;
          value_key?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_questions: {
        Row: {
          help_text: string | null;
          id: string;
          is_required: boolean;
          key: string;
          metadata: Json | null;
          prompt: string;
          question_type: Database["public"]["Enums"]["assessment_question_type"];
          section_id: string;
          sort_order: number;
          version_id: string;
          visual_style: string | null;
        };
        Insert: {
          help_text?: string | null;
          id?: string;
          is_required?: boolean;
          key: string;
          metadata?: Json | null;
          prompt: string;
          question_type: Database["public"]["Enums"]["assessment_question_type"];
          section_id: string;
          sort_order: number;
          version_id: string;
          visual_style?: string | null;
        };
        Update: {
          help_text?: string | null;
          id?: string;
          is_required?: boolean;
          key?: string;
          metadata?: Json | null;
          prompt?: string;
          question_type?: Database["public"]["Enums"]["assessment_question_type"];
          section_id?: string;
          sort_order?: number;
          version_id?: string;
          visual_style?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_questions_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "assessment_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assessment_questions_version_id_fkey";
            columns: ["version_id"];
            isOneToOne: false;
            referencedRelation: "assessment_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_sections: {
        Row: {
          description: string | null;
          id: string;
          key: string;
          section_theme: string | null;
          sort_order: number;
          subtitle: string | null;
          title: string;
          version_id: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          key: string;
          section_theme?: string | null;
          sort_order: number;
          subtitle?: string | null;
          title: string;
          version_id: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          key?: string;
          section_theme?: string | null;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_sections_version_id_fkey";
            columns: ["version_id"];
            isOneToOne: false;
            referencedRelation: "assessment_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_trait_map: {
        Row: {
          id: string;
          notes: string | null;
          option_value_key: string;
          question_id: string;
          reverse_scored: boolean;
          trait_key: string;
          weight: number;
        };
        Insert: {
          id?: string;
          notes?: string | null;
          option_value_key: string;
          question_id: string;
          reverse_scored?: boolean;
          trait_key: string;
          weight?: number;
        };
        Update: {
          id?: string;
          notes?: string | null;
          option_value_key?: string;
          question_id?: string;
          reverse_scored?: boolean;
          trait_key?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "assessment_trait_map_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      assessment_versions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          version_name: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          version_name: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          version_name?: string;
        };
        Relationships: [];
      };
      birth_profiles: {
        Row: {
          birth_city: string;
          birth_country: string;
          birth_date: string;
          birth_time: string | null;
          created_at: string;
          id: string;
          latitude: number | null;
          longitude: number | null;
          natal_chart_json: Json | null;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          birth_city: string;
          birth_country: string;
          birth_date: string;
          birth_time?: string | null;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          natal_chart_json?: Json | null;
          timezone: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          birth_city?: string;
          birth_country?: string;
          birth_date?: string;
          birth_time?: string | null;
          created_at?: string;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          natal_chart_json?: Json | null;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "birth_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      compatibility_reports: {
        Row: {
          created_at: string;
          id: string;
          partner_birth_data_json: Json;
          partner_name: string;
          relationship_type: Database["public"]["Enums"]["relationship_type"];
          report_json: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          partner_birth_data_json: Json;
          partner_name: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          report_json: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          partner_birth_data_json?: Json;
          partner_name?: string;
          relationship_type?: Database["public"]["Enums"]["relationship_type"];
          report_json?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_readings: {
        Row: {
          category: Database["public"]["Enums"]["reading_category"];
          created_at: string;
          id: string;
          output_text: string;
          prompt_context_json: Json | null;
          reading_date: string;
          saved_to_journal: boolean | null;
          tone: Database["public"]["Enums"]["reading_tone"];
          user_id: string;
        };
        Insert: {
          category?: Database["public"]["Enums"]["reading_category"];
          created_at?: string;
          id?: string;
          output_text: string;
          prompt_context_json?: Json | null;
          reading_date?: string;
          saved_to_journal?: boolean | null;
          tone?: Database["public"]["Enums"]["reading_tone"];
          user_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["reading_category"];
          created_at?: string;
          id?: string;
          output_text?: string;
          prompt_context_json?: Json | null;
          reading_date?: string;
          saved_to_journal?: boolean | null;
          tone?: Database["public"]["Enums"]["reading_tone"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_readings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      journal_entries: {
        Row: {
          ai_summary: string | null;
          body: string;
          created_at: string;
          entry_date: string;
          id: string;
          linked_reading_id: string | null;
          mood_score: number | null;
          mood_tag: string | null;
          title: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_summary?: string | null;
          body: string;
          created_at?: string;
          entry_date?: string;
          id?: string;
          linked_reading_id?: string | null;
          mood_score?: number | null;
          mood_tag?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_summary?: string | null;
          body?: string;
          created_at?: string;
          entry_date?: string;
          id?: string;
          linked_reading_id?: string | null;
          mood_score?: number | null;
          mood_tag?: string | null;
          title?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "journal_entries_linked_reading_id_fkey";
            columns: ["linked_reading_id"];
            isOneToOne: false;
            referencedRelation: "daily_readings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "journal_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      libra_profiles: {
        Row: {
          aesthetic_style: Database["public"]["Enums"]["aesthetic_style"] | null;
          ai_memory_summary: string | null;
          beauty_affinity: string | null;
          conflict_style: string | null;
          created_at: string;
          decision_style: string | null;
          emotional_pattern_summary: string | null;
          id: string;
          primary_archetype: Database["public"]["Enums"]["libra_archetype"];
          quiz_scores: Json | null;
          relationship_style: string | null;
          secondary_modifier: Database["public"]["Enums"]["archetype_modifier"] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          aesthetic_style?: Database["public"]["Enums"]["aesthetic_style"] | null;
          ai_memory_summary?: string | null;
          beauty_affinity?: string | null;
          conflict_style?: string | null;
          created_at?: string;
          decision_style?: string | null;
          emotional_pattern_summary?: string | null;
          id?: string;
          primary_archetype: Database["public"]["Enums"]["libra_archetype"];
          quiz_scores?: Json | null;
          relationship_style?: string | null;
          secondary_modifier?: Database["public"]["Enums"]["archetype_modifier"] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          aesthetic_style?: Database["public"]["Enums"]["aesthetic_style"] | null;
          ai_memory_summary?: string | null;
          beauty_affinity?: string | null;
          conflict_style?: string | null;
          created_at?: string;
          decision_style?: string | null;
          emotional_pattern_summary?: string | null;
          id?: string;
          primary_archetype?: Database["public"]["Enums"]["libra_archetype"];
          quiz_scores?: Json | null;
          relationship_style?: string | null;
          secondary_modifier?: Database["public"]["Enums"]["archetype_modifier"] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "libra_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      mood_logs: {
        Row: {
          confidence_score: number | null;
          created_at: string;
          id: string;
          log_date: string;
          mood_score: number | null;
          notes: string | null;
          romantic_energy_score: number | null;
          self_worth_score: number | null;
          social_energy_score: number | null;
          stress_score: number | null;
          user_id: string;
        };
        Insert: {
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          log_date?: string;
          mood_score?: number | null;
          notes?: string | null;
          romantic_energy_score?: number | null;
          self_worth_score?: number | null;
          social_energy_score?: number | null;
          stress_score?: number | null;
          user_id: string;
        };
        Update: {
          confidence_score?: number | null;
          created_at?: string;
          id?: string;
          log_date?: string;
          mood_score?: number | null;
          notes?: string | null;
          romantic_energy_score?: number | null;
          self_worth_score?: number | null;
          social_energy_score?: number | null;
          stress_score?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mood_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      onboarding_responses: {
        Row: {
          answer_label: string | null;
          answer_value: string;
          created_at: string;
          id: string;
          question_id: string;
          user_id: string;
        };
        Insert: {
          answer_label?: string | null;
          answer_value: string;
          created_at?: string;
          id?: string;
          question_id: string;
          user_id: string;
        };
        Update: {
          answer_label?: string | null;
          answer_value?: string;
          created_at?: string;
          id?: string;
          question_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      rituals: {
        Row: {
          completed_at: string | null;
          completion_status: boolean | null;
          created_at: string;
          id: string;
          ritual_date: string;
          ritual_json: Json;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          completion_status?: boolean | null;
          created_at?: string;
          id?: string;
          ritual_date?: string;
          ritual_json: Json;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          completion_status?: boolean | null;
          created_at?: string;
          id?: string;
          ritual_date?: string;
          ritual_json?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rituals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_name: string | null;
          provider: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_name?: string | null;
          provider?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_name?: string | null;
          provider?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_assessment_answers: {
        Row: {
          answered_at: string;
          id: string;
          numeric_response: number | null;
          question_id: string;
          rank_response: Json | null;
          selected_option_id: string | null;
          session_id: string;
          user_id: string;
        };
        Insert: {
          answered_at?: string;
          id?: string;
          numeric_response?: number | null;
          question_id: string;
          rank_response?: Json | null;
          selected_option_id?: string | null;
          session_id: string;
          user_id: string;
        };
        Update: {
          answered_at?: string;
          id?: string;
          numeric_response?: number | null;
          question_id?: string;
          rank_response?: Json | null;
          selected_option_id?: string | null;
          session_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_assessment_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_answers_selected_option_id_fkey";
            columns: ["selected_option_id"];
            isOneToOne: false;
            referencedRelation: "assessment_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_answers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "user_assessment_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_answers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_assessment_sessions: {
        Row: {
          completed_at: string | null;
          current_question_id: string | null;
          current_section_id: string | null;
          id: string;
          last_saved_at: string;
          progress_percent: number;
          started_at: string;
          status: Database["public"]["Enums"]["assessment_session_status"];
          user_id: string;
          version_id: string;
        };
        Insert: {
          completed_at?: string | null;
          current_question_id?: string | null;
          current_section_id?: string | null;
          id?: string;
          last_saved_at?: string;
          progress_percent?: number;
          started_at?: string;
          status?: Database["public"]["Enums"]["assessment_session_status"];
          user_id: string;
          version_id: string;
        };
        Update: {
          completed_at?: string | null;
          current_question_id?: string | null;
          current_section_id?: string | null;
          id?: string;
          last_saved_at?: string;
          progress_percent?: number;
          started_at?: string;
          status?: Database["public"]["Enums"]["assessment_session_status"];
          user_id?: string;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_assessment_sessions_current_question_id_fkey";
            columns: ["current_question_id"];
            isOneToOne: false;
            referencedRelation: "assessment_questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_sessions_current_section_id_fkey";
            columns: ["current_section_id"];
            isOneToOne: false;
            referencedRelation: "assessment_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_assessment_sessions_version_id_fkey";
            columns: ["version_id"];
            isOneToOne: false;
            referencedRelation: "assessment_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profile_summary: {
        Row: {
          ai_interpretation: Json | null;
          archetype_label: string | null;
          archetype_subtitle: string | null;
          created_at: string;
          emotional_summary: string | null;
          id: string;
          profile_summary: string | null;
          prompt_profile: Json | null;
          relational_summary: string | null;
          ritual_summary: string | null;
          updated_at: string;
          user_id: string;
          version_id: string;
        };
        Insert: {
          ai_interpretation?: Json | null;
          archetype_label?: string | null;
          archetype_subtitle?: string | null;
          created_at?: string;
          emotional_summary?: string | null;
          id?: string;
          profile_summary?: string | null;
          prompt_profile?: Json | null;
          relational_summary?: string | null;
          ritual_summary?: string | null;
          updated_at?: string;
          user_id: string;
          version_id: string;
        };
        Update: {
          ai_interpretation?: Json | null;
          archetype_label?: string | null;
          archetype_subtitle?: string | null;
          created_at?: string;
          emotional_summary?: string | null;
          id?: string;
          profile_summary?: string | null;
          prompt_profile?: Json | null;
          relational_summary?: string | null;
          ritual_summary?: string | null;
          updated_at?: string;
          user_id?: string;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profile_summary_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profile_summary_version_id_fkey";
            columns: ["version_id"];
            isOneToOne: false;
            referencedRelation: "assessment_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profile_traits: {
        Row: {
          confidence_score: number | null;
          id: string;
          normalized_score: number;
          percentile_band: string | null;
          raw_score: number | null;
          trait_key: string;
          updated_at: string;
          user_id: string;
          version_id: string;
        };
        Insert: {
          confidence_score?: number | null;
          id?: string;
          normalized_score?: number;
          percentile_band?: string | null;
          raw_score?: number | null;
          trait_key: string;
          updated_at?: string;
          user_id: string;
          version_id: string;
        };
        Update: {
          confidence_score?: number | null;
          id?: string;
          normalized_score?: number;
          percentile_band?: string | null;
          raw_score?: number | null;
          trait_key?: string;
          updated_at?: string;
          user_id?: string;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profile_traits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_profile_traits_version_id_fkey";
            columns: ["version_id"];
            isOneToOne: false;
            referencedRelation: "assessment_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          goals: string[] | null;
          id: string;
          onboarding_completed: boolean | null;
          pronouns: string | null;
          relationship_status: string | null;
          subscription_tier: Database["public"]["Enums"]["subscription_tier"];
          tone_preference: Database["public"]["Enums"]["reading_tone"] | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          goals?: string[] | null;
          id: string;
          onboarding_completed?: boolean | null;
          pronouns?: string | null;
          relationship_status?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          tone_preference?: Database["public"]["Enums"]["reading_tone"] | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          goals?: string[] | null;
          id?: string;
          onboarding_completed?: boolean | null;
          pronouns?: string | null;
          relationship_status?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          tone_preference?: Database["public"]["Enums"]["reading_tone"] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      aesthetic_style:
        | "soft_luxe"
        | "dark_romance"
        | "celestial_editorial"
        | "clean_goddess"
        | "velvet_minimalism"
        | "modern_venus";
      archetype_modifier:
        | "venus_heavy"
        | "emotionally_guarded"
        | "harmony_seeking"
        | "validation_driven"
        | "deeply_intuitive"
        | "detached_under_pressure"
        | "beauty_obsessed"
        | "indecisive_but_insightful";
      assessment_question_type: "likert" | "forced_choice" | "ranking" | "scenario_choice";
      assessment_session_status: "in_progress" | "completed" | "abandoned";
      libra_archetype:
        | "velvet_diplomat"
        | "romantic_strategist"
        | "mirror_heart"
        | "silent_scales"
        | "golden_idealist"
        | "aesthetic_oracle"
        | "people_pleaser_in_recovery"
        | "elegant_overthinker"
        | "soft_power_libra"
        | "cosmic_charmer";
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
      relationship_type: "romantic" | "friendship" | "coworker" | "ex" | "crush" | "family";
      subscription_tier: "free" | "premium";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      aesthetic_style: [
        "soft_luxe",
        "dark_romance",
        "celestial_editorial",
        "clean_goddess",
        "velvet_minimalism",
        "modern_venus",
      ],
      archetype_modifier: [
        "venus_heavy",
        "emotionally_guarded",
        "harmony_seeking",
        "validation_driven",
        "deeply_intuitive",
        "detached_under_pressure",
        "beauty_obsessed",
        "indecisive_but_insightful",
      ],
      assessment_question_type: ["likert", "forced_choice", "ranking", "scenario_choice"],
      assessment_session_status: ["in_progress", "completed", "abandoned"],
      libra_archetype: [
        "velvet_diplomat",
        "romantic_strategist",
        "mirror_heart",
        "silent_scales",
        "golden_idealist",
        "aesthetic_oracle",
        "people_pleaser_in_recovery",
        "elegant_overthinker",
        "soft_power_libra",
        "cosmic_charmer",
      ],
      reading_category: [
        "daily",
        "weekly",
        "monthly",
        "love",
        "friendship",
        "career",
        "confidence",
        "healing",
        "decision",
        "shadow",
        "beauty",
        "compatibility",
        "custom",
      ],
      reading_tone: ["gentle", "blunt", "poetic", "practical", "seductive"],
      relationship_type: ["romantic", "friendship", "coworker", "ex", "crush", "family"],
      subscription_tier: ["free", "premium"],
    },
  },
} as const;
