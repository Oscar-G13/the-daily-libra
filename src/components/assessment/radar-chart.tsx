"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { TraitScore } from "@/types/assessment";

const CX = 150;
const CY = 150;
const R_MAX = 100; // max data radius
const R_LABEL = 128; // label radius

// 5 category axes — clockwise from top
const AXES = [
  {
    label: ["Core", "Personality"],
    angle: -90,
    color: "#c4a05a",
    barGradient: "from-gold-200/70 to-bronze/70",
    traits: [
      "big_five_openness",
      "big_five_conscientiousness",
      "big_five_extraversion",
      "big_five_agreeableness",
      "big_five_emotional_sensitivity",
    ] as string[],
    traitLabels: {
      big_five_openness: "Openness",
      big_five_conscientiousness: "Conscientiousness",
      big_five_extraversion: "Extraversion",
      big_five_agreeableness: "Agreeableness",
      big_five_emotional_sensitivity: "Emo. Sensitivity",
    } as Record<string, string>,
  },
  {
    label: ["Cognition"],
    angle: -18,
    color: "#a78bfa",
    barGradient: "from-plum/70 to-purple-400/70",
    traits: ["cognition_intuitive", "cognition_structured", "cognition_internal_processing"],
    traitLabels: {
      cognition_intuitive: "Intuitive",
      cognition_structured: "Structured",
      cognition_internal_processing: "Internal Process",
    } as Record<string, string>,
  },
  {
    label: ["Relational"],
    angle: 54,
    color: "#f472b6",
    barGradient: "from-rose/70 to-pink-400/70",
    traits: [
      "relational_security",
      "relational_reassurance_need",
      "conflict_avoidance",
      "reciprocity_expectation",
      "validation_need",
      "harmony_drive",
    ],
    traitLabels: {
      relational_security: "Secure Attachment",
      relational_reassurance_need: "Reassurance Need",
      conflict_avoidance: "Conflict Avoidance",
      reciprocity_expectation: "Reciprocity",
      validation_need: "Validation Need",
      harmony_drive: "Harmony Drive",
    } as Record<string, string>,
  },
  {
    label: ["Emotional"],
    angle: 126,
    color: "#60a5fa",
    barGradient: "from-blue-400/70 to-cyan-400/70",
    traits: [
      "emotional_intensity",
      "overthinking_tendency",
      "ambiguity_tolerance",
      "solitude_recovery_need",
      "sensory_sensitivity",
    ],
    traitLabels: {
      emotional_intensity: "Intensity",
      overthinking_tendency: "Overthinking",
      ambiguity_tolerance: "Ambiguity Tol.",
      solitude_recovery_need: "Solitude Need",
      sensory_sensitivity: "Sensory Sensitivity",
    } as Record<string, string>,
  },
  {
    label: ["Aesthetic", "& Libra"],
    angle: 198,
    color: "#34d399",
    barGradient: "from-emerald-400/70 to-teal-400/70",
    traits: [
      "beauty_sensitivity",
      "fairness_sensitivity",
      "romantic_idealism",
      "ritual_receptivity",
      "self_expression_aesthetic",
    ],
    traitLabels: {
      beauty_sensitivity: "Beauty",
      fairness_sensitivity: "Fairness",
      romantic_idealism: "Romantic Idealism",
      ritual_receptivity: "Ritual Receptivity",
      self_expression_aesthetic: "Aesthetic Expr.",
    } as Record<string, string>,
  },
];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function pointAt(angleDeg: number, r: number) {
  const rad = toRad(angleDeg);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function polygonPoints(values: number[]) {
  return AXES.map((ax, i) => {
    const r = (values[i] / 100) * R_MAX;
    const p = pointAt(ax.angle, r);
    return `${p.x},${p.y}`;
  }).join(" ");
}

// Concentric grid pentagon at fraction 0–1
function gridPolygon(frac: number) {
  return AXES.map((ax) => {
    const p = pointAt(ax.angle, frac * R_MAX);
    return `${p.x},${p.y}`;
  }).join(" ");
}

interface RadarChartProps {
  traitScores: Record<string, TraitScore>;
}

export function RadarChart({ traitScores }: RadarChartProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Compute category averages (0–100)
  const categoryScores = useMemo(
    () =>
      AXES.map((ax) => {
        const vals = ax.traits
          .map((t) => traitScores[t]?.normalized_score ?? 0)
          .filter((v) => v > 0);
        if (vals.length === 0) return 0;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      }),
    [traitScores],
  );

  const activeAxis = AXES[activeIdx];

  return (
    <div className="space-y-6">
      {/* Radar SVG */}
      <div className="flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px]" aria-label="Trait radar chart">
          {/* Grid rings */}
          {[0.33, 0.66, 1].map((frac) => (
            <polygon
              key={frac}
              points={gridPolygon(frac)}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
          ))}

          {/* Axis spokes */}
          {AXES.map((ax) => {
            const tip = pointAt(ax.angle, R_MAX);
            return (
              <line
                key={ax.angle}
                x1={CX}
                y1={CY}
                x2={tip.x}
                y2={tip.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon — animates from center outward */}
          <motion.g style={{ transformOrigin: `${CX}px ${CY}px` }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}>
            <polygon
              points={polygonPoints(categoryScores)}
              fill="rgba(196,160,90,0.12)"
              stroke="rgba(196,160,90,0.5)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* Score dots */}
          {AXES.map((ax, i) => {
            const r = (categoryScores[i] / 100) * R_MAX;
            const p = pointAt(ax.angle, r);
            return (
              <motion.circle
                key={ax.angle}
                cx={p.x}
                cy={p.y}
                r="3"
                fill={ax.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
              />
            );
          })}

          {/* Axis labels — clickable */}
          {AXES.map((ax, i) => {
            const lp = pointAt(ax.angle, R_LABEL);
            const isActive = activeIdx === i;
            // Adjust text-anchor based on position
            const anchor =
              Math.abs(ax.angle % 360) < 20 || Math.abs((ax.angle % 360) - 360) < 20
                ? "middle" // top
                : ax.angle > 0 && ax.angle < 180
                  ? "start" // right side
                  : ax.angle > 180
                    ? "end" // left side
                    : "middle";

            return (
              <g
                key={ax.angle}
                onClick={() => setActiveIdx(i)}
                className="cursor-pointer"
                style={{ userSelect: "none" }}
              >
                {ax.label.map((line, li) => (
                  <text
                    key={li}
                    x={lp.x}
                    y={lp.y + li * 11 - ((ax.label.length - 1) * 11) / 2}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fontSize="9"
                    fill={isActive ? ax.color : "rgba(255,255,255,0.45)"}
                    fontWeight={isActive ? "600" : "400"}
                    style={{ transition: "fill 0.2s" }}
                  >
                    {line}
                  </text>
                ))}
                {/* Score badge */}
                <text
                  x={lp.x}
                  y={lp.y + ax.label.length * 11 - ((ax.label.length - 1) * 11) / 2 + 4}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={isActive ? ax.color : "rgba(255,255,255,0.2)"}
                >
                  {categoryScores[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {AXES.map((ax, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="px-3 py-1 rounded-full text-xs transition-all"
            style={{
              background: activeIdx === i ? `${ax.color}22` : "transparent",
              border: `1px solid ${activeIdx === i ? ax.color : "rgba(255,255,255,0.1)"}`,
              color: activeIdx === i ? ax.color : "rgba(255,255,255,0.4)",
            }}
          >
            {ax.label.join(" ")}
          </button>
        ))}
      </div>

      {/* Active category trait bars */}
      <motion.div
        key={activeIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-2.5"
      >
        {activeAxis.traits.map((traitKey) => {
          const score = traitScores[traitKey];
          const value = score?.normalized_score ?? 0;
          const label = activeAxis.traitLabels[traitKey] ?? traitKey;

          return (
            <div key={traitKey}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-foreground/70">{label}</span>
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
              <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
                  className={`h-full bg-gradient-to-r ${activeAxis.barGradient} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
