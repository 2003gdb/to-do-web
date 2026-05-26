/**
 * Verify firebase.ts initializes via firebase/app and firebase/auth correctly.
 * We do NOT test the SDK — only our singleton + persistence wiring.
 */

const initializeApp = jest.fn(() => ({ name: "app" }));
const getApps = jest.fn(() => []);
const getApp = jest.fn(() => ({ name: "existing" }));

const getAuth = jest.fn(() => ({ name: "auth" }));
const setPersistence = jest.fn(() => Promise.resolve());
const browserLocalPersistence = { kind: "local" };

jest.mock("firebase/app", () => ({
  initializeApp: (...args: unknown[]) => initializeApp(...args),
  getApps: () => getApps(),
  getApp: () => getApp(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: (...args: unknown[]) => getAuth(...args),
  setPersistence: (...args: unknown[]) => setPersistence(...args),
  browserLocalPersistence,
}));

function fresh() {
  let mod!: typeof import("./firebase");
  jest.isolateModules(() => {
    mod = require("./firebase");
  });
  return mod;
}

beforeEach(() => {
  initializeApp.mockClear();
  getApps.mockReset().mockReturnValue([]);
  getApp.mockClear();
  getAuth.mockClear();
  setPersistence.mockClear();
});

describe("firebase singleton", () => {
  it("initializes app on first call", () => {
    const { getFirebaseApp } = fresh();
    const app = getFirebaseApp();
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(app).toEqual({ name: "app" });
  });

  it("caches app across calls (no re-init)", () => {
    const { getFirebaseApp } = fresh();
    getFirebaseApp();
    getFirebaseApp();
    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it("uses existing app via getApp() when getApps().length > 0", () => {
    getApps.mockReturnValue([{ name: "existing" }]);
    const { getFirebaseApp } = fresh();
    const app = getFirebaseApp();
    expect(getApp).toHaveBeenCalled();
    expect(initializeApp).not.toHaveBeenCalled();
    expect(app).toEqual({ name: "existing" });
  });

  it("getFirebaseAuth creates auth, sets persistence, and caches", () => {
    const { getFirebaseAuth } = fresh();
    const a = getFirebaseAuth();
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(setPersistence).toHaveBeenCalledWith({ name: "auth" }, browserLocalPersistence);
    // Second call: cached
    const b = getFirebaseAuth();
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it("setPersistence rejection is swallowed", async () => {
    setPersistence.mockReturnValueOnce(Promise.reject(new Error("nope")));
    const { getFirebaseAuth } = fresh();
    expect(() => getFirebaseAuth()).not.toThrow();
    // Let microtask flush so the .catch() runs without unhandled rejection
    await Promise.resolve();
  });
});
