import "@testing-library/jest-dom";

// firebase/auth in Node-mode imports a fetch reference at module init.
// jsdom 30 doesn't expose `fetch` globally; provide a stub.
if (typeof globalThis.fetch === "undefined") {
  globalThis.fetch = (() => Promise.reject(new Error("fetch not implemented in tests"))) as typeof fetch;
}

// Fail tests on unexpected console.error / console.warn. Senior tests
// shouldn't leak React warnings, unhandled rejections, or noisy logs.
const ALLOW_PATTERNS: RegExp[] = [
  // jsdom doesn't implement navigation; some tests intentionally hit window.location.replace
  /Not implemented: navigation/i,
  // React Query logs query failures internally; we assert on isError instead.
  /Query data cannot be undefined/i,
  // React Query v5 internal error logging on failed queryFn
  /AxiosError/i,
  /Error: e$/i,
];

const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const msg = String(args[0] ?? "");
    if (ALLOW_PATTERNS.some((re) => re.test(msg))) return;
    originalError(...(args as Parameters<typeof console.error>));
    throw new Error(`Unexpected console.error: ${msg}`);
  });
  jest.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    const msg = String(args[0] ?? "");
    if (ALLOW_PATTERNS.some((re) => re.test(msg))) return;
    originalWarn(...(args as Parameters<typeof console.warn>));
    throw new Error(`Unexpected console.warn: ${msg}`);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});
