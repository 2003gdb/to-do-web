import { render, waitFor } from "@testing-library/react";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

import RootPage from "./page";
import { useAuthStore } from "@/store/useAuthStore";

beforeEach(() => {
  replace.mockClear();
  useAuthStore.setState({ user: null, token: null, hydrated: false });
});

describe("RootPage", () => {
  it("renders loading while not hydrated", () => {
    const { container } = render(<RootPage />);
    expect(container.firstChild).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /login when hydrated and unauthenticated", async () => {
    useAuthStore.setState({ hydrated: true, user: null });
    render(<RootPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("redirects to /home when hydrated and authenticated", async () => {
    useAuthStore.setState({
      hydrated: true,
      user: { uid: "x" } as unknown as ReturnType<typeof useAuthStore.getState>["user"],
    });
    render(<RootPage />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });
});
