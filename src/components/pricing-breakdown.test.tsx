import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PricingBreakdown } from "./pricing-breakdown";

describe("PricingBreakdown", () => {
  it("renders nightly rates and a formatted total", () => {
    render(
      <PricingBreakdown
        rates={[
          { date: "2026-06-01", rate: 150 },
          { date: "2026-06-02", rate: 200 },
        ]}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText("2 nights")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("$350")).toBeInTheDocument();
  });

  it("renders a fallback message when there is an error", () => {
    render(<PricingBreakdown rates={null} isLoading={false} error="boom" />);
    expect(screen.getByText(/contact us for pricing/i)).toBeInTheDocument();
  });

  it("renders nothing when rates are empty and not loading", () => {
    const { container } = render(<PricingBreakdown rates={[]} isLoading={false} error={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
