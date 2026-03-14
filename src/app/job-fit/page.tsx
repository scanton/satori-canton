"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AnalyzingState } from "@/components/job-fit/AnalyzingState";
import { ScoreGauge } from "@/components/job-fit/ScoreGauge";
import { StrengthsList } from "@/components/job-fit/StrengthsList";
import { WeaknessesList } from "@/components/job-fit/WeaknessesList";
import { RelevantStories } from "@/components/job-fit/RelevantStories";
import { LeadCaptureModal } from "@/components/job-fit/LeadCaptureModal";
import { InterviewChat } from "@/components/job-fit/InterviewChat";
import {
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { JobFitPhase, JobFitResult, LeadInfo, HeroStoryMeta } from "@/lib/types";

const MAX_JD_LENGTH = 8000;

export default function JobFitPage() {
  const [phase, setPhase] = useState<JobFitPhase>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobFitResult | null>(null);
  const [allStories, setAllStories] = useState<HeroStoryMeta[]>([]);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scorecardCollapsed, setScorecardCollapsed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription.trim()) return;
    setError(null);
    setPhase("analyzing");

    try {
      const [fitRes, storiesRes] = await Promise.all([
        fetch("/api/job-fit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription }),
        }),
        fetch("/api/stories"),
      ]);

      if (!fitRes.ok) {
        const data = await fitRes.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const fitData: JobFitResult = await fitRes.json();
      setResult(fitData);

      // Load stories for RelevantStories component (best effort)
      if (storiesRes.ok) {
        const stories: HeroStoryMeta[] = await storiesRes.json();
        setAllStories(stories);
      }

      setPhase("results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
      setPhase("input");
    }
  }, [jobDescription]);

  const handleBeginInterview = () => {
    setShowLeadModal(true);
  };

  const handleLeadSubmit = (info: LeadInfo) => {
    setLeadInfo(info);
    setShowLeadModal(false);
    setPhase("interview");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-normal mb-3">Evaluate Your Role</h1>
        <p className="text-muted-foreground leading-relaxed">
          Paste a job description and an AI agent will honestly assess how well
          Satori&apos;s background fits your needs — including strengths, gaps, and
          supporting evidence from real case studies.
        </p>
      </div>

      {/* Transparency note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/30 border border-border/50 mb-8 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
        <span>
          This AI analysis is powered by Satori&apos;s documented background and case
          stories. It is designed to be honest — including about gaps. Powered by{" "}
          <span className="text-foreground/80">OpenRouter</span>.
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Input Phase ─────────────────────────────────────────── */}
        {phase === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              <label htmlFor="jd" className="text-sm font-medium block">
                Job Description
              </label>
              <Textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here — the more detail, the more accurate the analysis..."
                className="min-h-[260px] text-sm leading-relaxed resize-none"
                maxLength={MAX_JD_LENGTH}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {jobDescription.length.toLocaleString()} /{" "}
                  {MAX_JD_LENGTH.toLocaleString()} characters
                </p>
                {error && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || jobDescription.length > MAX_JD_LENGTH}
                className="w-full gap-2"
                size="lg"
              >
                <Sparkles className="h-4 w-4" />
                Analyze Fit
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Analyzing Phase ─────────────────────────────────────── */}
        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyzingState />
          </motion.div>
        )}

        {/* ── Results Phase ───────────────────────────────────────── */}
        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Score + headline */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-xl border border-border/50 bg-card">
              <ScoreGauge score={result.score} grade={result.grade} />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-serif text-2xl font-normal mb-2">
                  {result.headline}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {result.roleAlignment}
                </p>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40 text-sm text-muted-foreground italic">
                  {result.recommendation}
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-serif text-xl font-normal mb-4 flex items-center gap-2">
                Strengths
                <Badge
                  variant="outline"
                  className="text-xs border-strength/40 text-strength bg-strength-muted/50"
                >
                  {result.strengths.length}
                </Badge>
              </h3>
              <StrengthsList strengths={result.strengths} />
            </div>

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-normal mb-4 flex items-center gap-2">
                  Gaps &amp; Weaknesses
                  <Badge
                    variant="outline"
                    className="text-xs border-weakness/40 text-weakness bg-weakness-muted/50"
                  >
                    {result.weaknesses.length}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mb-3 italic">
                  Honest assessment — these are real gaps, not spin.
                </p>
                <WeaknessesList weaknesses={result.weaknesses} />
              </div>
            )}

            {/* Relevant stories */}
            {result.relevantStoryIds.length > 0 && allStories.length > 0 && (
              <div>
                <h3 className="font-serif text-xl font-normal mb-4">
                  Relevant Case Studies
                </h3>
                <RelevantStories
                  storyIds={result.relevantStoryIds}
                  allStories={allStories}
                />
              </div>
            )}

            <Separator className="opacity-30" />

            {/* Begin interview CTA */}
            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-normal">
                Want to dig deeper?
              </h3>
              <p className="text-sm text-muted-foreground">
                Continue with a virtual interview — ask questions about
                Satori&apos;s background, approach, or this specific role.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button size="lg" onClick={handleBeginInterview} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Begin Virtual Interview
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setPhase("input");
                    setResult(null);
                  }}
                >
                  Analyze a Different Role
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Interview Phase ─────────────────────────────────────── */}
        {phase === "interview" && result && leadInfo && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Collapsed scorecard */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
                onClick={() => setScorecardCollapsed(!scorecardCollapsed)}
              >
                <span className="font-medium flex items-center gap-2">
                  Job Fit Summary
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    {result.grade} · {result.score}/100
                  </Badge>
                </span>
                {scorecardCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {!scorecardCollapsed && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border/30">
                      <p className="text-sm text-muted-foreground mt-3">
                        {result.headline}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">
                        {result.recommendation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat */}
            <InterviewChat
              jobDescription={jobDescription}
              jobFitResult={result}
              leadInfo={leadInfo}
            />

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setPhase("input");
                setResult(null);
                setLeadInfo(null);
              }}
            >
              Start Over with a Different Role
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead capture modal */}
      <LeadCaptureModal open={showLeadModal} onClose={() => setShowLeadModal(false)} onSubmit={handleLeadSubmit} />
    </div>
  );
}
