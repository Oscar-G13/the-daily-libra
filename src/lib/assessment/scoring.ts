export type TraitKey =
  | "big_five_openness"
  | "big_five_conscientiousness"
  | "big_five_extraversion"
  | "big_five_agreeableness"
  | "big_five_emotional_sensitivity"
  | "cognition_intuitive"
  | "cognition_structured"
  | "cognition_internal_processing"
  | "relational_security"
  | "relational_reassurance_need"
  | "conflict_avoidance"
  | "beauty_sensitivity"
  | "fairness_sensitivity"
  | "romantic_idealism"
  | "ritual_receptivity"
  | "sensory_sensitivity"
  | "solitude_recovery_need"
  | "overthinking_tendency"
  | "self_expression_aesthetic"
  | "emotional_intensity"
  | "reciprocity_expectation"
  | "ambiguity_tolerance"
  | "validation_need"
  | "harmony_drive";

export type PercentileBand = "low" | "medium_low" | "medium" | "medium_high" | "high";

export interface RawAnswer {
  question_id: string;
  question_type: "likert" | "forced_choice" | "ranking" | "scenario_choice";
  selected_option_id?: string | null;
  numeric_response?: number | null;
  rank_response?: string[] | null;
}

export interface TraitMapEntry {
  question_id: string;
  option_value_key: string;
  trait_key: string;
  weight: number;
  reverse_scored: boolean;
}

export interface OptionLookup {
  id: string;
  value_key: string;
  numeric_value: number;
  question_id: string;
}

export interface TraitScore {
  trait_key: TraitKey;
  raw_score: number;
  normalized_score: number;
  percentile_band: PercentileBand;
}

interface Accumulator {
  weightedSum: number;
  totalWeight: number;
}

export function computeTraitScores(
  answers: RawAnswer[],
  traitMaps: TraitMapEntry[],
  optionLookup: OptionLookup[]
): Record<TraitKey, Accumulator> {
  const acc: Partial<Record<TraitKey, Accumulator>> = {};

  const optionById = new Map<string, OptionLookup>();
  for (const o of optionLookup) optionById.set(o.id, o);

  // Group trait maps by question_id + option_value_key for fast lookup
  const traitMapIndex = new Map<string, TraitMapEntry[]>();
  for (const tm of traitMaps) {
    const key = `${tm.question_id}::${tm.option_value_key}`;
    const existing = traitMapIndex.get(key) ?? [];
    existing.push(tm);
    traitMapIndex.set(key, existing);
  }

  for (const answer of answers) {
    const { question_id, question_type, selected_option_id, numeric_response, rank_response } =
      answer;

    if (question_type === "ranking" && rank_response) {
      // Each ranked item: weight = base_weight * (1 / (rankIndex + 1))
      rank_response.forEach((optionValueKey, rankIndex) => {
        const entries = traitMapIndex.get(`${question_id}::${optionValueKey}`) ?? [];
        for (const tm of entries) {
          const tk = tm.trait_key as TraitKey;
          const positionWeight = tm.weight * (1 / (rankIndex + 1));
          const current = acc[tk] ?? { weightedSum: 0, totalWeight: 0 };
          acc[tk] = {
            weightedSum: current.weightedSum + positionWeight,
            totalWeight: current.totalWeight + tm.weight,
          };
        }
      });
      continue;
    }

    if (!selected_option_id) continue;

    const option = optionById.get(selected_option_id);
    if (!option) continue;

    const entries = traitMapIndex.get(`${question_id}::${option.value_key}`) ?? [];
    for (const tm of entries) {
      const tk = tm.trait_key as TraitKey;

      let value: number;
      if (question_type === "likert") {
        // Likert 1-5, normalized to 0-1
        const rawNumeric = numeric_response ?? option.numeric_value;
        value = tm.reverse_scored ? (6 - rawNumeric) / 5 : rawNumeric / 5;
      } else {
        // forced_choice / scenario_choice: binary 0 or 1
        value = option.numeric_value > 0 ? 1 : 0;
        if (tm.reverse_scored) value = 1 - value;
      }

      const current = acc[tk] ?? { weightedSum: 0, totalWeight: 0 };
      acc[tk] = {
        weightedSum: current.weightedSum + value * tm.weight,
        totalWeight: current.totalWeight + tm.weight,
      };
    }
  }

  return acc as Record<TraitKey, Accumulator>;
}

export function normalizeTraitScores(
  raw: Record<TraitKey, Accumulator>
): Record<TraitKey, TraitScore> {
  const result = {} as Record<TraitKey, TraitScore>;

  for (const [key, val] of Object.entries(raw) as [TraitKey, Accumulator][]) {
    const normalized =
      val.totalWeight > 0 ? Math.round((val.weightedSum / val.totalWeight) * 100) : 50;

    result[key] = {
      trait_key: key,
      raw_score: val.totalWeight > 0 ? val.weightedSum / val.totalWeight : 0.5,
      normalized_score: Math.max(0, Math.min(100, normalized)),
      percentile_band: normalizeToPercentileBand(normalized),
    };
  }

  return result;
}

export function normalizeToPercentileBand(score: number): PercentileBand {
  if (score < 20) return "low";
  if (score < 40) return "medium_low";
  if (score < 60) return "medium";
  if (score < 80) return "medium_high";
  return "high";
}
