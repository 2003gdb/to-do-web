import { render, screen } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/home",
}));

import ProtectedLayout from "./layout";
import { useAuthStore } from "@/store/useAuthStore";

beforeEach(() => {
  replace.mockClear();
  useAuthStore.setState({ user: null, token: null, hydrated: false });
});

describe("ProtectedLayout", () => {
  it("renders Loading when not hydrated", () => {
    const { container } = render(
      <ProtectedLayout>
        <span data-testid="c">x</span>
      </ProtectedLayout>
    );
    expect(screen.queryByTestId("c")).toBeNull();
    expect(container.querySelector("span")).toBeTruthy();
  });

  it("renders shell + children when hydrated and authed", () => {
    useAuthStore.setState({
      hydrated: true,
      user: { uid: "x" } as unknown as ReturnType<typeof useAuthStore.getState>["user"],
    });
    render(
      <ProtectedLayout>
        <span data-testid="c">x</span>
      </ProtectedLayout>
    );
    expect(screen.getByTestId("c")).toBeInTheDocument();
  });
});
