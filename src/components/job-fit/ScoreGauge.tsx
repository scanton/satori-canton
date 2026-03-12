"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { gradeLabel } from "@/lib/utils";
import type { JobFitResult } from "@/lib/types";

interface ScoreGaugeProps {
  score: number;
  grade: JobFitResult["grade"];
}

const gradeColors: Record<JobFitResult["grade"], string> = {
  A: "hsl(152 69% 45%)",
  B: "hsl(152 50% 40%)",
  C: "hsl(45 90% 50%)",
  D: "hsl(30 90% 50%)",
  F: "hsl(0 70% 55%)",
};

const SIZE = 160;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({ score, grade }: ScoreGaugeProps) {
  const displayScore = useMotionValue(0);
  const displayScoreSpring = useSpring(displayScore, { duration: 1400, bounce: 0 });
  const roundedScore = useTransform(displayScoreSpring, (v) => Math.round(v));

  const dashOffset = useTransform(
    displayScoreSpring,
    (v) => CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE
  );

  useEffect(() => {
    const controls = animate(displayScore, score, { duration: 1.4, ease: "easeOut" });
    return controls.stop;
  }, [score, displayScore]);

  const color = gradeColors[grade];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="rotate-[-90deg]"
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={STROKE}
          />
          {/* Animated arc */}
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold font-sans tabular-nums"
            style={{ color }}
          >
            {roundedScore}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div
        className="px-3 py-1 rounded-full text-sm font-semibold font-sans"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        Grade {grade} — {gradeLabel(grade)}
      </div>
    </div>
  );
}
