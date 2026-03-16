"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          {error.message && !error.message.includes("NEXT_")
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
