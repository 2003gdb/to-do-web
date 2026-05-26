import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const register = jest.fn();
const mapAuthError = jest.fn(() => "mapped");
jest.mock("@/services/authService", () => ({
  register: (...a: unknown[]) => register(...a),
  mapAuthError: () => mapAuthError(),
}));

import RegisterPage from "./page";

beforeEach(() => {
  replace.mockClear();
  register.mockReset();
  mapAuthError.mockClear();
});

describe("RegisterPage", () => {
  it("validates required fields", () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Complete all fields");
    expect(register).not.toHaveBeenCalled();
  });

  it("submits and redirects on success", async () => {
    register.mockResolvedValueOnce({ token: "t" });
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        fullName: "Alice",
        email: "a@b",
        password: "pw",
      })
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  it("uses mapAuthError for firebase code errors", async () => {
    const err = { code: "auth/email-already-in-use" };
    register.mockImplementationOnce(() => Promise.reject(err));
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "e" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);
    await waitFor(() => expect(mapAuthError).toHaveBeenCalled());
    expect(screen.getByRole("alert")).toHaveTextContent("mapped");
  });

  it("uses errorMessage fallback when error has no code", async () => {
    register.mockImplementationOnce(() => Promise.reject(new Error("backend down")));
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "e" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("backend down"));
    expect(mapAuthError).not.toHaveBeenCalled();
  });
});
