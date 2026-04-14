import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobFitPage from "@/app/job-fit/page";

// Stub framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren<object>) => children,
}));

vi.mock("@/components/job-fit/AnalyzingState", () => ({
  AnalyzingState: () => <div data-testid="analyzing-state">Analyzing...</div>,
}));

vi.mock("@/components/job-fit/ScoreGauge", () => ({
  ScoreGauge: ({ score, grade }: { score: number; grade: string }) => (
    <div data-testid="score-gauge">{score} {grade}</div>
  ),
}));

vi.mock("@/components/job-fit/StrengthsList", () => ({
  StrengthsList: () => <div data-testid="strengths" />,
}));

vi.mock("@/components/job-fit/WeaknessesList", () => ({
  WeaknessesList: () => <div data-testid="weaknesses" />,
}));

vi.mock("@/components/job-fit/RelevantStories", () => ({
  RelevantStories: () => <div data-testid="stories" />,
}));

vi.mock("@/components/job-fit/LeadCaptureModal", () => ({
  LeadCaptureModal: () => null,
}));

vi.mock("@/components/job-fit/InterviewChat", () => ({
  InterviewChat: () => <div data-testid="interview-chat" />,
}));

const validResult = {
  score: 78,
  grade: "B",
  headline: "Strong technical fit",
  roleAlignment: "Good alignment.",
  recommendation: "Solid recommendation that is valid.",
  strengths: [{ claim: "AI expertise", evidence: "...", heroStoryIds: [] }],
  weaknesses: [],
  relevantStoryIds: [],
  id: "share-id-123",
  cached: false,
};

function mockFetch(result = validResult, ok = true) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === "/api/job-fit") {
      return Promise.resolve({
        ok,
        json: () => Promise.resolve(ok ? result : { error: "Analysis failed" }),
      });
    }
    if (url === "/api/stories") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
  });
}

beforeEach(() => {
  mockFetch();
});

describe("JobFitPage", () => {
  it("renders textarea and Analyze button on initial state", () => {
    render(<JobFitPage />);
    expect(screen.getByPlaceholderText(/Paste the full job description/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Analyze Fit/i })).toBeInTheDocument();
  });

  it("Analyze button is disabled when textarea is empty", () => {
    render(<JobFitPage />);
    const btn = screen.getByRole("button", { name: /Analyze Fit/i });
    expect(btn).toBeDisabled();
  });

  it("Analyze button is enabled after typing", async () => {
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Senior AI Engineer at Acme Corp");
    expect(screen.getByRole("button", { name: /Analyze Fit/i })).not.toBeDisabled();
  });

  it("shows analyzing state after clicking Analyze", async () => {
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Senior AI Engineer at Acme Corp");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));
    expect(screen.getByTestId("analyzing-state")).toBeInTheDocument();
  });

  it("shows results after successful analysis", async () => {
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Senior AI Engineer at Acme Corp");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));

    await waitFor(() => {
      expect(screen.getByText("Strong technical fit")).toBeInTheDocument();
    });
  });

  it("shows Share Analysis button when id is returned", async () => {
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Senior AI Engineer at Acme Corp");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Copy analysis link/i })).toBeInTheDocument();
    });
  });

  it("does NOT show Share Analysis button when id is null", async () => {
    mockFetch({ ...validResult, id: null });
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Some role");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));

    await waitFor(() => {
      expect(screen.getByText("Strong technical fit")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /Copy analysis link/i })).not.toBeInTheDocument();
  });

  it("shows error message on API failure", async () => {
    mockFetch(undefined, false);
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Some role description");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));

    await waitFor(() => {
      expect(screen.getByText("Analysis failed")).toBeInTheDocument();
    });
  });

  it("returns to input phase on error", async () => {
    mockFetch(undefined, false);
    render(<JobFitPage />);
    const textarea = screen.getByPlaceholderText(/Paste the full job description/);
    await userEvent.type(textarea, "Some role description");
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Analyze Fit/i })).toBeInTheDocument();
    });
  });
});
