import { render, renderHook, waitFor, act } from "@testing-library/react";
import { useAuthHydrator, useRequireAuth, useRedirectIfAuthed } from "./useAuth";
import { useAuthStore } from "@/store/useAuthStore";

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const subscribeAuth = jest.fn();
jest.mock("@/services/authService", () => ({
  subscribeAuth: (...a: unknown[]) => subscribeAuth(...a),
}));

beforeEach(() => {
  replace.mockClear();
  subscribeAuth.mockReset();
  useAuthStore.setState({ user: null, token: null, hydrated: false });
  localStorage.clear();
});

function HydrateProbe() {
  useAuthHydrator();
  return null;
}

describe("useAuthHydrator", () => {
  it("with cached token: sets token and waits for firebase before hydrating", () => {
    localStorage.setItem("token", "cached");
    subscribeAuth.mockReturnValueOnce(() => undefined);
    render(<HydrateProbe />);
    expect(useAuthStore.getState().token).toBe("cached");
    // no firebase callback yet => not hydrated
    expect(useAuthStore.getState().hydrated).toBe(false);
  });

  it("without cached token: hydrates immediately", () => {
    subscribeAuth.mockReturnValueOnce(() => undefined);
    render(<HydrateProbe />);
    expect(useAuthStore.getState().hydrated).toBe(true);
  });

  it("subscribeAuth callback updates user/token/hydrated", () => {
    let captured: ((u: unknown, t: string | null) => void) | null = null;
    subscribeAuth.mockImplementationOnce((cb) => {
      captured = cb;
      return () => undefined;
    });
    render(<HydrateProbe />);
    expect(captured).not.toBeNull();
    act(() => {
      captured!({ uid: "u1" }, "tok");
    });
    expect(useAuthStore.getState().user).toEqual({ uid: "u1" });
    expect(useAuthStore.getState().token).toBe("tok");
    expect(useAuthStore.getState().hydrated).toBe(true);
  });

  it("subscribeAuth throwing logs and still hydrates", () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    subscribeAuth.mockImplementationOnce(() => {
      throw new Error("fb down");
    });
    render(<HydrateProbe />);
    expect(useAuthStore.getState().hydrated).toBe(true);
    expect(errSpy).toHaveBeenCalled();
  });

  it("fallback timer hydrates after 2s even without subscribe callback", () => {
    jest.useFakeTimers();
    localStorage.setItem("token", "cached"); // would NOT hydrate immediately
    subscribeAuth.mockReturnValueOnce(() => undefined);
    render(<HydrateProbe />);
    expect(useAuthStore.getState().hydrated).toBe(false);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(useAuthStore.getState().hydrated).toBe(true);
    jest.useRealTimers();
  });

  it("unmount calls unsub and clears timer", () => {
    const unsub = jest.fn();
    subscribeAuth.mockReturnValueOnce(unsub);
    const { unmount } = render(<HydrateProbe />);
    unmount();
    expect(unsub).toHaveBeenCalled();
  });
});

describe("useRequireAuth", () => {
  it("redirects to /login when hydrated and no user", async () => {
    useAuthStore.setState({ hydrated: true, user: null });
    renderHook(() => useRequireAuth());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("does NOT redirect while hydrating", () => {
    useAuthStore.setState({ hydrated: false, user: null });
    renderHook(() => useRequireAuth());
    expect(replace).not.toHaveBeenCalled();
  });

  it("does NOT redirect when user exists", () => {
    useAuthStore.setState({
      hydrated: true,
      user: { uid: "x" } as unknown as ReturnType<typeof useAuthStore.getState>["user"],
    });
    renderHook(() => useRequireAuth());
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("useRedirectIfAuthed", () => {
  it("redirects to /home when authed", async () => {
    useAuthStore.setState({
      hydrated: true,
      user: { uid: "x" } as unknown as ReturnType<typeof useAuthStore.getState>["user"],
    });
    renderHook(() => useRedirectIfAuthed());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  it("does NOT redirect when no user", () => {
    useAuthStore.setState({ hydrated: true, user: null });
    renderHook(() => useRedirectIfAuthed());
    expect(replace).not.toHaveBeenCalled();
  });
});
