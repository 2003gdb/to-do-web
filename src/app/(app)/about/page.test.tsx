import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const logout = jest.fn();
jest.mock("@/services/authService", () => ({ logout: (...a: unknown[]) => logout(...a) }));

import AboutPage from "./page";
import { useAuthStore } from "@/store/useAuthStore";

beforeEach(() => {
  replace.mockClear();
  logout.mockReset().mockResolvedValue(undefined);
  useAuthStore.setState({
    user: { email: "a@b.c", displayName: "Alice" } as unknown as ReturnType<
      typeof useAuthStore.getState
    >["user"],
    token: "t",
    hydrated: true,
  });
});

describe("AboutPage", () => {
  it("shows current user email and name", () => {
    render(<AboutPage />);
    expect(screen.getByText("a@b.c")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("falls back to 'Not set' when no email", () => {
    useAuthStore.setState({
      user: { displayName: "x" } as unknown as ReturnType<
        typeof useAuthStore.getState
      >["user"],
    });
    render(<AboutPage />);
    expect(screen.getByText("Not set")).toBeInTheDocument();
  });

  it("hides Name section when no displayName", () => {
    useAuthStore.setState({
      user: { email: "x@y" } as unknown as ReturnType<
        typeof useAuthStore.getState
      >["user"],
    });
    render(<AboutPage />);
    expect(screen.queryByText("Name")).toBeNull();
  });

  it("Log out triggers logout(), reset, and navigation", async () => {
    render(<AboutPage />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    await waitFor(() => expect(logout).toHaveBeenCalled());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
