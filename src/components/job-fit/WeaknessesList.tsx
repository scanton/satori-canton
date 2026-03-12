"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle } from "lucide-react";
import type { JobFitWeakness } from "@/lib/types";

interface WeaknessesListProps {
  weaknesses: JobFitWeakness[];
}

export function WeaknessesList({ weaknesses }: WeaknessesListProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (weaknesses.length === 0) return null;

  return (
    <div className="space-y-2">
      {weaknesses.map((weakness, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.07 }}
          className="rounded-lg border border-weakness/20 bg-weakness-muted/40 overflow-hidden"
        >
          <button
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-weakness-muted/60 transition-colors"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <AlertCircle className="h-4 w-4 text-weakness shrink-0 mt-0.5" />
            <span className="flex-1 text-sm font-medium text-foreground">
              {weakness.gap}
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
                <div className="px-4 pb-4 pt-0 border-t border-weakness/10">
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    {weakness.context}
                  </p>
                  {weakness.mitigation && (
                    <p className="text-sm text-muted-foreground/80 italic mt-2">
                      Note: {weakness.mitigation}
                    </p>
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
