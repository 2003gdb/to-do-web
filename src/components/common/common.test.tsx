import { render, screen, fireEvent } from "@testing-library/react";
import { Loading } from "./Loading";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

describe("Loading", () => {
  it("renders default label", () => {
    render(<Loading />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
  it("renders custom label and className", () => {
    const { container } = render(<Loading label="hold on" className="extra" />);
    expect(screen.getByText("hold on")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("extra");
  });
});

describe("ErrorState", () => {
  it("renders message without retry button when no onRetry", () => {
    render(<ErrorState message="bad" />);
    expect(screen.getByText("bad")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
  it("renders retry button and fires callback", () => {
    const onRetry = jest.fn();
    render(<ErrorState message="bad" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("EmptyState", () => {
  it("renders title only", () => {
    render(<EmptyState title="Nothing" />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });
  it("renders description and action", () => {
    render(
      <EmptyState
        title="t"
        description="d"
        action={<button>Add</button>}
      />
    );
    expect(screen.getByText("d")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
