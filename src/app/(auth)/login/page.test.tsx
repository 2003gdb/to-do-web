import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const login = jest.fn();
const mapAuthError = jest.fn((e: { code?: string; message?: string }) => e.code ?? "err");

jest.mock("@/services/authService", () => ({
  login: (...a: unknown[]) => login(...a),
  mapAuthError: (e: unknown) => mapAuthError(e as { code?: string; message?: string }),
}));

import LoginPage from "./page";

beforeEach(() => {
  replace.mockClear();
  login.mockReset();
  mapAuthError.mockClear();
});

describe("LoginPage", () => {
  it("shows validation error when fields empty", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter email and password");
    expect(login).not.toHaveBeenCalled();
  });

  it("calls login and navigates on success", async () => {
    login.mockResolvedValueOnce({ token: "t" });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(login).toHaveBeenCalledWith("a@b.c", "pw"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  it("shows mapped error on login failure", async () => {
    login.mockRejectedValueOnce({ code: "auth/wrong-password" });
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(mapAuthError).toHaveBeenCalled();
  });

  it("link to /register present", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: "Create one" });
    expect(link).toHaveAttribute("href", "/register");
  });
});
