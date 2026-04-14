"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_MESSAGES = [
  "Reading job description...",
  "Mapping requirements to background...",
  "Identifying key strengths...",
  "Being honest about gaps...",
  "Finding relevant case stories...",
  "Crafting honest recommendation...",
];

interface AnalyzingStateProps {
  startTime?: number;
  onCancel?: () => void;
}

export function AnalyzingState({ startTime, onCancel }: AnalyzingStateProps) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Cycle through normal status messages every 1.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed seconds when startTime is provided
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [startTime]);

  // Time-based override messages (honest about what's actually happening)
  let displayMessage: string;
  if (startTime && elapsed >= 15) {
    displayMessage = "Trying a backup model — almost done.";
  } else if (startTime && elapsed >= 5) {
    displayMessage = "Free-tier model is warming up — this may take a moment.";
  } else {
    displayMessage = STATUS_MESSAGES[index];
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
      </div>

      <div className="min-h-[28px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={displayMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-muted-foreground text-center"
          >
            {displayMessage}
          </motion.p>
        </AnimatePresence>
      </div>

      {onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}
