import { useAuthStore } from "./useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.setState({ hydrated: false });
  });

  it("setToken stores token in localStorage", () => {
    useAuthStore.getState().setToken("abc");
    expect(localStorage.getItem("token")).toBe("abc");
    expect(useAuthStore.getState().token).toBe("abc");
  });

  it("reset clears user, token, and localStorage", () => {
    useAuthStore.getState().setToken("abc");
    useAuthStore.getState().reset();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });
});
