import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AnalyzingState } from "@/components/job-fit/AnalyzingState";

// Stub framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => children,
}));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AnalyzingState", () => {
  it("renders initial status message", () => {
    render(<AnalyzingState />);
    expect(screen.getByText("Reading job description...")).toBeInTheDocument();
  });

  it("shows default cycling message when no startTime provided", async () => {
    render(<AnalyzingState />);
    // Advance past the normal 1.8s cycle
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    // Should still show a normal message (not the "warming up" message)
    expect(
      screen.queryByText(/warming up/)
    ).not.toBeInTheDocument();
  });

  it("shows 'warming up' message after 5s when startTime provided", async () => {
    const startTime = Date.now();
    render(<AnalyzingState startTime={startTime} />);

    act(() => {
      vi.advanceTimersByTime(5500); // advance past 5s threshold
    });

    expect(
      screen.getByText("Free-tier model is warming up — this may take a moment.")
    ).toBeInTheDocument();
  });

  it("shows 'backup model' message after 15s", async () => {
    const startTime = Date.now();
    render(<AnalyzingState startTime={startTime} />);

    act(() => {
      vi.advanceTimersByTime(15500);
    });

    expect(
      screen.getByText("Trying a backup model — almost done.")
    ).toBeInTheDocument();
  });

  it("cycles through normal messages when elapsed < 5s", () => {
    const startTime = Date.now();
    render(<AnalyzingState startTime={startTime} />);

    // At 0s, should show first normal message
    expect(screen.getByText("Reading job description...")).toBeInTheDocument();
  });

  it("cleans up intervals on unmount", () => {
    const { unmount } = render(<AnalyzingState startTime={Date.now()} />);
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
