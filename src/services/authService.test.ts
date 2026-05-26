/**
 * authService tests. We mock firebase/auth, ./firebase, ./apiClient, and the
 * zustand store via real import (it's small).
 */
const signInWithEmailAndPassword = jest.fn();
const createUserWithEmailAndPassword = jest.fn();
const signOut = jest.fn();
const onIdTokenChanged = jest.fn();

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: (...a: unknown[]) => signInWithEmailAndPassword(...a),
  createUserWithEmailAndPassword: (...a: unknown[]) => createUserWithEmailAndPassword(...a),
  signOut: (...a: unknown[]) => signOut(...a),
  onIdTokenChanged: (...a: unknown[]) => onIdTokenChanged(...a),
}));

jest.mock("./firebase", () => ({
  getFirebaseAuth: jest.fn(() => ({ name: "auth" })),
}));

const apiPost = jest.fn();
jest.mock("./apiClient", () => ({
  __esModule: true,
  default: { post: (...a: unknown[]) => apiPost(...a) },
}));

import * as svc from "./authService";
import { useAuthStore } from "@/store/useAuthStore";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, hydrated: false });
});

describe("login", () => {
  it("stores token in localStorage and updates store", async () => {
    const user = { uid: "u1", getIdToken: jest.fn().mockResolvedValue("tok") };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user });
    const result = await svc.login("a@b.c", "pw");
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      { name: "auth" },
      "a@b.c",
      "pw"
    );
    expect(localStorage.getItem("token")).toBe("tok");
    expect(useAuthStore.getState().user).toBe(user);
    expect(useAuthStore.getState().token).toBe("tok");
    expect(useAuthStore.getState().hydrated).toBe(true);
    expect(result.token).toBe("tok");
  });

  it("propagates firebase errors", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error("nope"));
    await expect(svc.login("a", "b")).rejects.toThrow("nope");
  });
});

describe("register", () => {
  it("calls POST /users then logs in", async () => {
    apiPost.mockResolvedValueOnce({ data: {} });
    const user = { getIdToken: jest.fn().mockResolvedValue("tok") };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user });
    await svc.register({ fullName: "F", email: "e", password: "p" });
    expect(apiPost).toHaveBeenCalledWith("/users", {
      fullName: "F",
      email: "e",
      password: "p",
    });
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });

  it("ignores 409 from /users (already exists) and still logs in", async () => {
    apiPost.mockRejectedValueOnce({ response: { status: 409 } });
    const user = { getIdToken: jest.fn().mockResolvedValue("tok") };
    signInWithEmailAndPassword.mockResolvedValueOnce({ user });
    await expect(
      svc.register({ fullName: "F", email: "e", password: "p" })
    ).resolves.toMatchObject({ token: "tok" });
  });

  it("rethrows non-409 errors from /users", async () => {
    apiPost.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(
      svc.register({ fullName: "F", email: "e", password: "p" })
    ).rejects.toMatchObject({ response: { status: 500 } });
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("rethrows when error has no response", async () => {
    apiPost.mockRejectedValueOnce(new Error("net"));
    await expect(svc.register({ fullName: "F", email: "e", password: "p" })).rejects.toThrow(
      "net"
    );
  });
});

describe("logout", () => {
  it("calls signOut, clears localStorage, resets store", async () => {
    localStorage.setItem("token", "x");
    useAuthStore.setState({ token: "x" });
    signOut.mockResolvedValueOnce(undefined);
    await svc.logout();
    expect(signOut).toHaveBeenCalledWith({ name: "auth" });
    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe("subscribeAuth", () => {
  it("invokes callback with user+token when signed in", async () => {
    const cb = jest.fn();
    onIdTokenChanged.mockImplementationOnce(
      (_auth: unknown, fn: (u: unknown) => Promise<void>) => {
        const user = { getIdToken: jest.fn().mockResolvedValue("tk") };
        return fn(user).then(() => () => undefined);
      }
    );
    const ret = await svc.subscribeAuth(cb);
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ getIdToken: expect.any(Function) }),
      "tk"
    );
    expect(localStorage.getItem("token")).toBe("tk");
    expect(typeof ret).toBe("function");
  });

  it("invokes callback with null when signed out and clears token", async () => {
    localStorage.setItem("token", "old");
    const cb = jest.fn();
    onIdTokenChanged.mockImplementationOnce(
      (_auth: unknown, fn: (u: unknown) => void | Promise<void>) => {
        const r = fn(null);
        return Promise.resolve(r).then(() => () => undefined);
      }
    );
    await svc.subscribeAuth(cb);
    expect(cb).toHaveBeenCalledWith(null, null);
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("mapAuthError", () => {
  it.each([
    ["auth/invalid-email", "Invalid email address."],
    ["auth/user-not-found", "Wrong email or password."],
    ["auth/wrong-password", "Wrong email or password."],
    ["auth/invalid-credential", "Wrong email or password."],
    ["auth/email-already-in-use", "Email is already registered."],
    ["auth/weak-password", "Password must be at least 6 characters."],
    ["auth/network-request-failed", "Network error. Check your connection."],
  ])("maps %s", (code, msg) => {
    expect(svc.mapAuthError({ code })).toBe(msg);
  });

  it("falls back to Error.message", () => {
    expect(svc.mapAuthError(new Error("custom"))).toBe("custom");
  });

  it("falls back to generic when no message and no code", () => {
    expect(svc.mapAuthError({})).toBe("Something went wrong.");
  });

  it("handles unknown code with message", () => {
    expect(svc.mapAuthError({ code: "auth/other", message: "x" })).toBe("x");
  });
});
