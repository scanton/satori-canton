"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SkillCategory } from "@/lib/types";

interface SkillsSectionProps {
  skills: SkillCategory[];
}

const levelConfig: Record<
  SkillCategory["level"],
  { label: string; className: string }
> = {
  expert: {
    label: "Expert",
    className:
      "border-primary/40 text-primary bg-primary/10",
  },
  proficient: {
    label: "Proficient",
    className:
      "border-border text-foreground bg-muted",
  },
  familiar: {
    label: "Familiar",
    className:
      "border-border text-muted-foreground bg-muted/50",
  },
};

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="space-y-6">
      {skills.map((cat, i) => {
        const level = levelConfig[cat.level];
        return (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground font-sans">
                {cat.category}
              </h3>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                  level.className
                )}
              >
                {level.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
