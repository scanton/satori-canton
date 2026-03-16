"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, User, Bot, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobFitResult, LeadInfo } from "@/lib/types";

const LOG_DELAY_MS = 30 * 60 * 1000; // 30 minutes

interface InterviewChatProps {
  jobDescription: string;
  jobFitResult: JobFitResult;
  leadInfo: LeadInfo;
}

export function InterviewChat({
  jobDescription,
  jobFitResult,
  leadInfo,
}: InterviewChatProps) {
  const isFirstMessage = useRef(true);
  const logSent = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } =
    useChat({
      api: "/api/chat",
      body: {
        jobDescription,
        jobFitResult,
        leadInfo,
        isFirstMessage: isFirstMessage.current,
      },
      onFinish: () => {
        isFirstMessage.current = false;
        setChatError(null);
      },
      onError: (err) => {
        const msg = (err.message ?? "").toLowerCase();
        if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many")) {
          setChatError("The AI service is rate-limited right now. Please wait a moment and try again.");
        } else if (msg.includes("overload") || msg.includes("503") || msg.includes("capacity") || msg.includes("no endpoints")) {
          setChatError("The AI model is temporarily overloaded. Please try again in a few seconds.");
        } else if (msg.includes("timeout") || msg.includes("timed out")) {
          setChatError("The request timed out. Please try again.");
        } else {
          setChatError("The AI service had a hiccup. Please try again.");
        }
      },
    });

  // Keep a ref to messages so timer/cleanup closures always see current value
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Start 30-min auto-send timer on first message
  useEffect(() => {
    if (messages.length === 1 && !timerRef.current && !logSent.current) {
      timerRef.current = setTimeout(() => {
        postLog(messagesRef.current);
      }, LOG_DELAY_MS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // On unmount: cancel timer, send log via sendBeacon (survives page close)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!logSent.current && messagesRef.current.length > 0) {
        logSent.current = true;
        const body = JSON.stringify({
          messages: messagesRef.current,
          leadInfo,
          jobFitResult,
          jobDescription,
        });
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/chat/log",
            new Blob([body], { type: "application/json" })
          );
        } else {
          fetch("/api/chat/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function postLog(msgs: typeof messages) {
    if (logSent.current || msgs.length === 0) return;
    logSent.current = true;
    fetch("/api/chat/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, leadInfo, jobFitResult, jobDescription }),
    }).catch((err) => console.error("[chat] Failed to send interview log:", err));
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-[500px] rounded-xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-muted/30 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-strength animate-pulse" />
        <span className="text-sm font-medium">Virtual Interview</span>
        <span className="text-xs text-muted-foreground ml-auto">
          AI represents Satori&apos;s documented background
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
              <p className="text-sm text-foreground leading-relaxed">
                Hi {leadInfo.name}! I&apos;ve reviewed the job fit analysis and I&apos;m
                ready to talk through any questions you have about my background or
                how I might approach this role. What would you like to know?
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                message.role === "user"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-primary/10 border border-primary/20"
              )}
            >
              {message.role === "user" ? (
                <User className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-primary" />
              )}
            </div>
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted/50 text-foreground rounded-tl-none"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {(error || chatError) && (
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {chatError ?? "Something went wrong. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => { setChatError(null); reload(); }}
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 bg-background/50">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Satori's background, approach, or experience..."
            className="min-h-[44px] max-h-32 resize-none text-sm"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </motion.div>
  );
}
