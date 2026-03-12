"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Profile } from "@/lib/types";

interface ProfileHeroProps {
  profile: Profile;
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.08), transparent)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Availability badge */}
          {profile.availableForWork && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <Badge
                variant="outline"
                className="gap-1.5 border-strength/40 text-strength bg-strength-muted/50 text-xs"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-strength animate-pulse" />
                Available for new engagements
              </Badge>
            </motion.div>
          )}

          {/* Name and title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-serif text-5xl sm:text-6xl font-normal mb-3 leading-tight"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-4"
          >
            {profile.title} · {profile.contact.location}
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg text-foreground/80 mb-8 leading-relaxed max-w-2xl"
          >
            {profile.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/job-fit">
              <Button size="lg" className="gap-2 group">
                <Sparkles className="h-4 w-4" />
                Evaluate Your Role
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button size="lg" variant="outline" className="gap-2">
                View Resume
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
