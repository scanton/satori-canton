"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { LeadInfo } from "@/lib/types";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (leadInfo: LeadInfo) => void;
}

export function LeadCaptureModal({ open, onClose, onSubmit }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setError("");
    onSubmit({ name: name.trim(), email: email.trim(), company: company.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-normal flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Begin the Interview
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Introduce yourself to start a personalized conversation with
            Satori&apos;s AI agent about your role and how this background may fit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label htmlFor="lead-name" className="text-sm font-medium mb-1.5 block">
              Your Name <span className="text-destructive">*</span>
            </label>
            <input
              id="lead-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="lead-email" className="text-sm font-medium mb-1.5 block">
              Work Email <span className="text-destructive">*</span>
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="lead-company" className="text-sm font-medium mb-1.5 block">
              Company / Role{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="lead-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp · Head of Engineering"
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="pt-1">
            <Button type="submit" className="w-full gap-2">
              <Sparkles className="h-4 w-4" />
              Start Interview
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Your information will only be used to notify Satori of your interest.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
