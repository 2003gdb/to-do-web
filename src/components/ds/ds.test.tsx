import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { Chip } from "./Chip";
import { Field } from "./Field";
import { IconTile } from "./IconTile";
import { Input } from "./Input";
import { Pill } from "./Pill";
import { Textarea } from "./Textarea";

describe("Button", () => {
  it("renders primary by default", () => {
    render(<Button label="Save" />);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute("type", "button");
  });

  it("respects custom type attribute", () => {
    render(<Button label="x" type="submit" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button label="x" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("disabled when explicitly disabled", () => {
    render(<Button label="x" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disabled when loading; shows loading label", () => {
    render(<Button label="Save" loading loadingLabel="Saving…" />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("Saving…");
  });

  it("shows label when loading and no loadingLabel", () => {
    render(<Button label="Save" loading />);
    expect(screen.getByRole("button")).toHaveTextContent("Save");
  });

  it("renders left icon by default", () => {
    render(<Button label="x" icon={<span data-testid="ic" />} />);
    const btn = screen.getByRole("button");
    expect(btn.firstChild).toHaveAttribute("data-testid", "ic");
  });

  it("renders right icon when iconRight", () => {
    render(<Button label="x" icon={<span data-testid="ic" />} iconRight />);
    const btn = screen.getByRole("button");
    expect(btn.lastChild).toHaveAttribute("data-testid", "ic");
  });

  it("fullWidth applies w-full class", () => {
    render(<Button label="x" fullWidth />);
    expect(screen.getByRole("button").className).toMatch(/w-full/);
  });

  it.each(["secondary", "ghost", "danger"] as const)("variant=%s renders", (v) => {
    render(<Button label="x" variant={v} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it.each(["md", "lg"] as const)("size=%s renders", (s) => {
    render(<Button label="x" size={s} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = jest.fn();
    render(<Button label="x" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(<Button label="x" disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Card", () => {
  it("renders children, padded by default", () => {
    render(
      <Card>
        <span data-testid="c">hi</span>
      </Card>
    );
    expect(screen.getByTestId("c")).toBeInTheDocument();
  });
  it("dark variant uses dark classes; unpadded works", () => {
    const { container } = render(
      <Card dark padded={false}>
        x
      </Card>
    );
    expect(container.firstChild).toHaveClass("bg-text-primary");
  });
});

describe("Chip", () => {
  it("default unselected", () => {
    render(<Chip label="A" />);
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
  });
  it("selected applies accent classes", () => {
    render(<Chip label="A" selected />);
    expect(screen.getByRole("button").className).toMatch(/bg-accent/);
  });
  it("dot renders an indicator", () => {
    const { container } = render(<Chip label="A" dot />);
    expect(container.querySelectorAll("span").length).toBeGreaterThan(1);
  });
  it("disabled prevents onClick", () => {
    const fn = jest.fn();
    render(<Chip label="A" disabled onClick={fn} />);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });
  it("fires onClick when not disabled", () => {
    const fn = jest.fn();
    render(<Chip label="A" onClick={fn} />);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalled();
  });
  it("size=sm renders", () => {
    render(<Chip label="A" size="sm" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
  it("dot when selected uses contrast color", () => {
    const { container } = render(<Chip label="A" selected dot />);
    const spans = container.querySelectorAll("span");
    // second span is the dot
    expect(spans[1].className).toMatch(/bg-accent-contrast/);
  });
});

describe("Field", () => {
  it("renders label tied to htmlFor", () => {
    render(
      <Field label="Email" htmlFor="email">
        <input id="email" />
      </Field>
    );
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email");
  });
  it("renders hint when provided", () => {
    render(
      <Field hint="optional">
        <input />
      </Field>
    );
    expect(screen.getByText("optional")).toBeInTheDocument();
  });
  it("omits label and hint when not provided", () => {
    render(
      <Field>
        <input data-testid="x" />
      </Field>
    );
    expect(screen.getByTestId("x")).toBeInTheDocument();
  });
});

describe("IconTile", () => {
  it("renders default symbol", () => {
    render(<IconTile />);
    expect(screen.getByText("•")).toBeInTheDocument();
  });
  it("renders custom symbol + bg + className", () => {
    const { container } = render(<IconTile symbol="#" bg="bg-x" className="cls" />);
    expect(container.firstChild).toHaveClass("bg-x");
    expect(container.firstChild).toHaveClass("cls");
    expect(screen.getByText("#")).toBeInTheDocument();
  });
});

describe("Input", () => {
  it("forwards ref and handles changes", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = jest.fn();
    render(<Input ref={ref} onChange={onChange} placeholder="e" />);
    const el = screen.getByPlaceholderText("e") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalled();
    expect(ref.current).toBe(el);
  });

  it("respects disabled", () => {
    render(<Input disabled placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toBeDisabled();
  });
});

describe("Pill", () => {
  it.each(["default", "success", "warning", "danger", "accent", "dark"] as const)(
    "tone=%s renders label",
    (tone) => {
      const { container } = render(<Pill label="L" tone={tone} dot />);
      expect(container.firstChild).toHaveTextContent("L");
    }
  );
});

describe("Textarea", () => {
  it("forwards ref and respects rows default 3", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="t" />);
    const el = screen.getByPlaceholderText("t") as HTMLTextAreaElement;
    expect(el.rows).toBe(3);
    expect(ref.current).toBe(el);
  });
  it("overrides rows", () => {
    render(<Textarea rows={7} placeholder="t" />);
    expect((screen.getByPlaceholderText("t") as HTMLTextAreaElement).rows).toBe(7);
  });
});
