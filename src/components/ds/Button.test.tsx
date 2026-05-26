import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders label", () => {
    render(<Button label="Save" />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows loading label when loading", () => {
    render(<Button label="Save" loading loadingLabel="Saving…" />);
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("fires onClick", () => {
    const onClick = jest.fn();
    render(<Button label="Click" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
