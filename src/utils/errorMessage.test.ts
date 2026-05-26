import { AxiosError } from "axios";
import { errorMessage } from "./errorMessage";

function makeAxiosError(opts: {
  response?: { data?: unknown; status?: number };
  code?: string;
  message?: string;
}): AxiosError {
  const err = new AxiosError(opts.message ?? "axios message");
  if (opts.response) {
    err.response = {
      data: opts.response.data,
      status: opts.response.status ?? 500,
      statusText: "",
      headers: {},
      config: {} as never,
    };
  }
  if (opts.code) err.code = opts.code;
  return err;
}

describe("errorMessage", () => {
  it("returns response.data.message when present", () => {
    const err = makeAxiosError({ response: { data: { message: "bad input" } } });
    expect(errorMessage(err)).toBe("bad input");
  });

  it("falls back to response.data.error when no message", () => {
    const err = makeAxiosError({ response: { data: { error: "boom" } } });
    expect(errorMessage(err)).toBe("boom");
  });

  it("falls back to axios message when data has neither", () => {
    const err = makeAxiosError({ response: { data: {} }, message: "Request failed" });
    expect(errorMessage(err)).toBe("Request failed");
  });

  it("returns axios.message even when empty string (?? only nullish-falls-through)", () => {
    // Contract: ?? falls through only on null/undefined. An empty message is kept.
    const err = makeAxiosError({ response: { data: {} }, message: "" });
    expect(errorMessage(err, "FB")).toBe("");
  });

  it("uses fallback when axios message is undefined AND data has no message/error", () => {
    const err = makeAxiosError({ response: { data: {} } });
    // axios sets a default message ("axios message" in our helper) so we go to that path
    expect(errorMessage(err, "FB")).toBe("axios message");
  });

  it("handles network error (no response, no ECONNABORTED)", () => {
    const err = new AxiosError("Network Error");
    expect(errorMessage(err)).toBe(
      "Cannot reach server. Check your connection or try again later."
    );
  });

  it("handles timeout (ECONNABORTED)", () => {
    const err = makeAxiosError({ code: "ECONNABORTED" });
    expect(errorMessage(err)).toBe("Server took too long to respond. Try again.");
  });

  it("returns plain Error.message", () => {
    expect(errorMessage(new Error("plain"))).toBe("plain");
  });

  it("returns fallback for non-Error values", () => {
    expect(errorMessage("string err", "FB")).toBe("FB");
    expect(errorMessage(undefined, "FB")).toBe("FB");
    expect(errorMessage(null, "FB")).toBe("FB");
    expect(errorMessage({ random: 1 }, "FB")).toBe("FB");
  });

  it("uses default fallback when none provided", () => {
    expect(errorMessage(42)).toBe("Something went wrong.");
  });

  it("does not crash when response.data is undefined", () => {
    const err = makeAxiosError({ response: { data: undefined }, message: "m" });
    expect(errorMessage(err)).toBe("m");
  });
});
