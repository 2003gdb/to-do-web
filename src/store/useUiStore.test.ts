import { useUiStore } from "./useUiStore";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ filter: "all" });
  });

  it("default filter is 'all'", () => {
    expect(useUiStore.getState().filter).toBe("all");
  });

  it("setFilter updates state", () => {
    useUiStore.getState().setFilter("pending");
    expect(useUiStore.getState().filter).toBe("pending");
    useUiStore.getState().setFilter("completed");
    expect(useUiStore.getState().filter).toBe("completed");
  });
});
