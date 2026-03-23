"use client";

import { motion } from "framer-motion";
import { LikertOptions } from "./likert-options";
import { ChoiceOptions } from "./choice-options";
import { RankingOptions } from "./ranking-options";
import type { AssessmentQuestion, AssessmentOption, AnswerSubmission } from "@/types/assessment";

interface QuestionCardProps {
  question: AssessmentQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (submission: AnswerSubmission) => void;
  disabled?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
}: QuestionCardProps) {
  function handleLikert(option: AssessmentOption, numericResponse: number) {
    onAnswer({
      question_id: question.id,
      selected_option_id: option.id,
      numeric_response: numericResponse,
    });
  }

  function handleChoice(option: AssessmentOption) {
    onAnswer({
      question_id: question.id,
      selected_option_id: option.id,
      numeric_response: option.numeric_value,
    });
  }

  function handleRanking(rankedValueKeys: string[]) {
    onAnswer({
      question_id: question.id,
      rank_response: rankedValueKeys,
    });
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card p-6 sm:p-8 w-full max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <p className="text-xs text-muted-foreground mb-4">
          {questionNumber} / {totalQuestions}
        </p>
        <h2 className="font-serif text-lg sm:text-xl text-foreground leading-relaxed">
          {question.prompt}
        </h2>
        {question.help_text && (
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{question.help_text}</p>
        )}
      </div>

      {question.question_type === "likert" && (
        <LikertOptions
          options={question.assessment_options}
          onSelect={handleLikert}
          disabled={disabled}
        />
      )}

      {(question.question_type === "forced_choice" ||
        question.question_type === "scenario_choice") && (
        <ChoiceOptions
          options={question.assessment_options}
          onSelect={handleChoice}
          disabled={disabled}
        />
      )}

      {question.question_type === "ranking" && (
        <RankingOptions
          options={question.assessment_options}
          onSubmit={handleRanking}
          disabled={disabled}
        />
      )}
    </motion.div>
  );
}
