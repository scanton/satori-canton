import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <span {...props}>{children}</span>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@/components/layout/ThemeToggle", () => ({
  ThemeToggle: () => <button aria-label="Toggle theme" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<object>) => (
    <button {...props}>{children}</button>
  ),
}));

import { NavBar } from "@/components/layout/NavBar";

describe("NavBar", () => {
  it("renders the Open Source nav link", () => {
    render(<NavBar />);
    const links = screen.getAllByRole("link", { name: /Open Source/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/open-source");
  });

  it("renders all primary nav links", () => {
    render(<NavBar />);
    expect(screen.getAllByRole("link", { name: /Case Stories/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Open Source/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Services/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Resume/i }).length).toBeGreaterThan(0);
  });

  it("renders the site wordmark", () => {
    render(<NavBar />);
    expect(screen.getByText("Satori Canton")).toBeInTheDocument();
  });
});
