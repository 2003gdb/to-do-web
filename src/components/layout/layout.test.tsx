import { render, screen } from "@testing-library/react";

const pathnameRef = { current: "/home" };
jest.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

import { AppShell } from "./AppShell";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { PageHeader } from "./PageHeader";

beforeEach(() => {
  pathnameRef.current = "/home";
});

describe("BottomNav", () => {
  it("renders three items", () => {
    render(<BottomNav />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Lists")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("marks current path active", () => {
    pathnameRef.current = "/home";
    const { container } = render(<BottomNav />);
    const home = container.querySelector('a[href="/home"]');
    expect(home?.className).toMatch(/bg-accent-muted/);
  });

  it("treats nested paths as active (startsWith /)", () => {
    pathnameRef.current = "/categories/abc";
    const { container } = render(<BottomNav />);
    const lists = container.querySelector('a[href="/categories"]');
    expect(lists?.className).toMatch(/bg-accent-muted/);
  });

  it("non-matching path is inactive", () => {
    pathnameRef.current = "/other";
    const { container } = render(<BottomNav />);
    const home = container.querySelector('a[href="/home"]');
    expect(home?.className).not.toMatch(/bg-accent-muted/);
  });
});

describe("SideNav", () => {
  it("renders todo brand and items", () => {
    render(<SideNav />);
    expect(screen.getByText("todo")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
  it("active styling on nested path", () => {
    pathnameRef.current = "/categories/abc";
    const { container } = render(<SideNav />);
    const lists = container.querySelector('a[href="/categories"]');
    expect(lists?.className).toMatch(/bg-accent-muted/);
  });
  it("inactive styling on unrelated path", () => {
    pathnameRef.current = "/about";
    const { container } = render(<SideNav />);
    const home = container.querySelector('a[href="/home"]');
    expect(home?.className).not.toMatch(/bg-accent-muted/);
  });
});

describe("AppShell", () => {
  it("renders children plus nav scaffolding", () => {
    render(
      <AppShell>
        <span data-testid="child">x</span>
      </AppShell>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="hello" />);
    expect(screen.getByRole("heading", { name: "hello" })).toBeInTheDocument();
  });
  it("renders back link when backHref provided", () => {
    const { container } = render(<PageHeader title="t" backHref="/home" />);
    expect(container.querySelector('a[href="/home"]')).not.toBeNull();
  });
  it("renders right slot", () => {
    render(<PageHeader title="t" right={<button>R</button>} />);
    expect(screen.getByRole("button", { name: "R" })).toBeInTheDocument();
  });
  it("omits title when not provided", () => {
    render(<PageHeader backHref="/" />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
