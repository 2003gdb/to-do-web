import { useAuthStore } from "./useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.setState({ hydrated: false });
    localStorage.clear();
  });

  it("default state is unauthenticated and not hydrated", () => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().hydrated).toBe(false);
  });

  it("setUser updates state", () => {
    const user = { uid: "u1" } as unknown as Parameters<
      typeof useAuthStore.getState
    > extends never
      ? never
      : Parameters<ReturnType<typeof useAuthStore.getState>["setUser"]>[0];
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user).toBe(user);
  });

  it("setToken with value persists to localStorage", () => {
    useAuthStore.getState().setToken("abc");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(useAuthStore.getState().token).toBe("abc");
  });

  it("setToken with null removes localStorage", () => {
    localStorage.setItem("token", "abc");
    useAuthStore.getState().setToken(null);
    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("setHydrated updates flag", () => {
    useAuthStore.getState().setHydrated(true);
    expect(useAuthStore.getState().hydrated).toBe(true);
  });

  it("reset clears user, token, and localStorage", () => {
    useAuthStore.getState().setToken("abc");
    useAuthStore.getState().reset();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
