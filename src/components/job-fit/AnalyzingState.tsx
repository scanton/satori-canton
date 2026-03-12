"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const STATUS_MESSAGES = [
  "Reading job description...",
  "Mapping requirements to background...",
  "Identifying key strengths...",
  "Being honest about gaps...",
  "Finding relevant hero stories...",
  "Crafting honest recommendation...",
];

export function AnalyzingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
      </div>

      <div className="h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground text-center"
          >
            {STATUS_MESSAGES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground/60">
        Powered by AI · Calibrated for honesty
      </p>
    </div>
  );
}
