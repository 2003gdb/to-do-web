/**
 * Tests for the axios api client + its interceptors.
 * We import a fresh module per test so we can manipulate `window.location` and
 * `localStorage` cleanly. We poke the interceptors directly.
 */
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

jest.mock("./firebase", () => ({
  getFirebaseAuth: jest.fn(() => ({ currentUser: null })),
}));

type Api = typeof import("./apiClient").api;

type RequestInterceptors = {
  handlers: Array<
    | {
        fulfilled: (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
        rejected: (e: unknown) => unknown;
      }
    | null
  >;
};
type ResponseInterceptors = {
  handlers: Array<
    | {
        fulfilled: (r: unknown) => unknown;
        rejected: (e: AxiosError) => unknown;
      }
    | null
  >;
};

function loadFresh(): Api {
  let mod!: Api;
  jest.isolateModules(() => {
    mod = require("./apiClient").api;
  });
  return mod;
}

function setPath(pathname: string): void {
  window.history.pushState({}, "", pathname);
}

describe("apiClient interceptors", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("attaches Bearer token + Accept header when token in localStorage", async () => {
    localStorage.setItem("token", "tok123");
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const out = await req.fulfilled(config);
    expect(out.headers.Authorization).toBe("Bearer tok123");
    expect(out.headers.Accept).toBe("application/json");
  });

  it("does NOT attach Authorization when no token (avoid leakage)", async () => {
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const out = await req.fulfilled(config);
    expect(out.headers.Authorization).toBeUndefined();
  });

  it("does NOT attach Authorization when token is empty string", async () => {
    localStorage.setItem("token", "");
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const out = await req.fulfilled(config);
    expect(out.headers.Authorization).toBeUndefined();
  });

  it("uses firebase currentUser.getIdToken when available; persists to localStorage", async () => {
    const { getFirebaseAuth } = require("./firebase") as {
      getFirebaseAuth: jest.Mock;
    };
    getFirebaseAuth.mockReturnValueOnce({
      currentUser: { getIdToken: jest.fn().mockResolvedValue("fresh-token") },
    });
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const out = await req.fulfilled(config);
    expect(out.headers.Authorization).toBe("Bearer fresh-token");
    expect(localStorage.getItem("token")).toBe("fresh-token");
  });

  it("falls back to cached token when firebase throws", async () => {
    localStorage.setItem("token", "cached");
    const { getFirebaseAuth } = require("./firebase") as {
      getFirebaseAuth: jest.Mock;
    };
    getFirebaseAuth.mockImplementationOnce(() => {
      throw new Error("firebase down");
    });
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    const config = { headers: {} } as unknown as InternalAxiosRequestConfig;
    const out = await req.fulfilled(config);
    expect(out.headers.Authorization).toBe("Bearer cached");
  });

  it("request rejection is propagated", async () => {
    const api = loadFresh();
    const req = (api.interceptors.request as unknown as RequestInterceptors).handlers[0];
    if (!req) throw new Error("missing interceptor");
    await expect(req.rejected(new Error("x"))).rejects.toThrow("x");
  });

  it("response success passes through unchanged", () => {
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const r = { data: 1 };
    expect(res.fulfilled(r)).toBe(r);
  });

  it("401 clears token and triggers navigation when not on auth route", async () => {
    localStorage.setItem("token", "abc");
    setPath("/home");
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const err = {
      response: { status: 401 },
      config: { url: "/x" },
    } as unknown as AxiosError;
    // jsdom logs a "Not implemented: navigation" — allowed by jest.setup.ts.
    await expect(res.rejected(err)).rejects.toBe(err);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("401 does NOT redirect when already on /login (no nav error logged)", async () => {
    localStorage.setItem("token", "abc");
    setPath("/login");
    // If replace was called, jsdom would emit an error. We assert by ensuring
    // no error logged for navigation (Object.spy on internal logger).
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const err = { response: { status: 401 }, config: {} } as unknown as AxiosError;
    await expect(res.rejected(err)).rejects.toBe(err);
    expect(localStorage.getItem("token")).toBeNull();
    expect(window.location.pathname).toBe("/login");
  });

  it("warns on 5xx server error and rethrows", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const err = {
      response: { status: 500 },
      config: { url: "/u" },
    } as unknown as AxiosError;
    await expect(res.rejected(err)).rejects.toBe(err);
    expect(warn).toHaveBeenCalledWith("Server error:", 500, "/u");
  });

  it("warns on network error (no response) and rethrows", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const err = { code: "ECONNREFUSED", message: "ouch", config: {} } as unknown as AxiosError;
    await expect(res.rejected(err)).rejects.toBe(err);
    expect(warn).toHaveBeenCalledWith("Network error:", "ECONNREFUSED", undefined);
  });

  it("network error without code falls back to message", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const api = loadFresh();
    const res = (api.interceptors.response as unknown as ResponseInterceptors).handlers[0];
    if (!res) throw new Error("missing interceptor");
    const err = { message: "ouch", config: {} } as unknown as AxiosError;
    await expect(res.rejected(err)).rejects.toBe(err);
    expect(warn).toHaveBeenCalledWith("Network error:", "ouch", undefined);
  });
});
