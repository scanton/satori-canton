"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

export function useScrollReveal(options?: {
  once?: boolean;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: options?.once ?? true,
    margin: (options?.margin ?? "-60px") as Parameters<typeof useInView>[1] extends { margin?: infer M } ? M : never,
  });

  return { ref, isInView };
}
