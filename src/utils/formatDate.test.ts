import { formatDate, formatDateTime } from "./formatDate";

describe("formatDate", () => {
  it("returns empty string when no input", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("returns the original string when invalid ISO", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });

  it("formats a valid ISO timestamp without throwing and produces a non-empty result", () => {
    const out = formatDate("2024-06-15T12:00:00.000Z");
    expect(out).not.toBe("");
    expect(out).not.toBe("2024-06-15T12:00:00.000Z");
  });
});

describe("formatDateTime", () => {
  it("returns empty string when no input", () => {
    expect(formatDateTime(undefined)).toBe("");
  });

  it("returns the original string when invalid ISO", () => {
    expect(formatDateTime("nope")).toBe("nope");
  });

  it("returns a non-empty string for valid date", () => {
    const out = formatDateTime("2024-06-15T12:00:00.000Z");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});
