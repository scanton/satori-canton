"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, ExternalLink } from "lucide-react";
import type { JobFitStrength } from "@/lib/types";

interface StrengthsListProps {
  strengths: JobFitStrength[];
}

export function StrengthsList({ strengths }: StrengthsListProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {strengths.map((strength, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.07 }}
          className="rounded-lg border border-strength/20 bg-strength-muted/40 overflow-hidden"
        >
          <button
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-strength-muted/60 transition-colors"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <CheckCircle2 className="h-4 w-4 text-strength shrink-0 mt-0.5" />
            <span className="flex-1 text-sm font-medium text-foreground">
              {strength.claim}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                expanded === i ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expanded === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 pt-0 border-t border-strength/10">
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-3">
                    {strength.evidence}
                  </p>
                  {strength.heroStoryIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {strength.heroStoryIds.map((id) => (
                        <Link
                          key={id}
                          href={`/story/${id}`}
                          className="inline-flex items-center gap-1 text-xs text-strength font-medium hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          See hero story
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
