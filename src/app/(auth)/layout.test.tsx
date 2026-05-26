import { render, screen } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

import AuthLayout from "./layout";
import { useAuthStore } from "@/store/useAuthStore";

beforeEach(() => {
  replace.mockClear();
  useAuthStore.setState({ user: null, token: null, hydrated: false });
});

describe("AuthLayout", () => {
  it("renders children", () => {
    render(
      <AuthLayout>
        <span data-testid="c">x</span>
      </AuthLayout>
    );
    expect(screen.getByTestId("c")).toBeInTheDocument();
  });

  it("redirects when hydrated and user present", async () => {
    useAuthStore.setState({
      hydrated: true,
      user: { uid: "u" } as unknown as ReturnType<typeof useAuthStore.getState>["user"],
    });
    render(
      <AuthLayout>
        <span>x</span>
      </AuthLayout>
    );
    expect(replace).toHaveBeenCalledWith("/home");
  });
});
