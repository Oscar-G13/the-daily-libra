export type AssessmentQuestionType = "likert" | "forced_choice" | "ranking" | "scenario_choice";
export type AssessmentSessionStatus = "in_progress" | "completed" | "abandoned";

export interface AssessmentOption {
  id: string;
  value_key: string;
  label: string;
  numeric_value: number;
  sort_order: number;
  metadata?: Record<string, unknown> | null;
}

export interface AssessmentQuestion {
  id: string;
  key: string;
  prompt: string;
  help_text?: string | null;
  question_type: AssessmentQuestionType;
  is_required: boolean;
  sort_order: number;
  visual_style?: string | null;
  metadata?: Record<string, unknown> | null;
  assessment_options: AssessmentOption[];
}

export interface AssessmentSection {
  id: string;
  key: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  sort_order: number;
  section_theme?: string | null;
  assessment_questions: AssessmentQuestion[];
}

export interface AssessmentSession {
  id: string;
  user_id: string;
  version_id: string;
  status: AssessmentSessionStatus;
  started_at: string;
  completed_at?: string | null;
  current_question_id?: string | null;
  progress_percent: number;
  last_saved_at: string;
}

export interface AnswerSubmission {
  question_id: string;
  selected_option_id?: string;
  numeric_response?: number;
  rank_response?: string[];
}

export interface TraitScore {
  trait_key: string;
  raw_score: number;
  normalized_score: number;
  percentile_band: string;
}

export interface ProfileSummary {
  archetype_label: string;
  archetype_subtitle: string;
  profile_summary: string;
  relational_summary: string;
  emotional_summary: string;
  ritual_summary: string;
  system_prompt_fragment: string;
  tone_rules: {
    preferred_tone: string;
    avoid: string[];
  };
  content_preferences: {
    high_resonance_topics: string[];
    low_resonance_topics: string[];
  };
}
