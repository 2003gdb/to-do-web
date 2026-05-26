import { cn } from "./cn";

describe("cn", () => {
  it("joins strings with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values (false, null, undefined, 0, empty string)", () => {
    expect(cn("a", false, null, undefined, 0, "", "b")).toBe("a b");
  });

  it("handles conditional object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens nested arrays", () => {
    expect(cn(["a", ["b", ["c"]]], "d")).toBe("a b c d");
  });

  it("returns empty string for no truthy input", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("does NOT dedupe duplicate class names (clsx contract)", () => {
    // Verify actual clsx behavior, not invented behavior — clsx does not dedupe.
    expect(cn("a", "a", "b")).toBe("a a b");
  });
});
