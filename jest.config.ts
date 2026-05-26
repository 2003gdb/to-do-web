import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^firebase/auth$": "<rootDir>/__mocks__/firebase-auth.ts",
    "^firebase/app$": "<rootDir>/__mocks__/firebase-app.ts",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } },
        },
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/cypress/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.stories.tsx",
    "!src/**/*.test.{ts,tsx}",
    "!src/types/**",
    "!src/test-utils/**",
    // Root layout pulls next/font which can't easily run in jsdom; the layout
    // is a trivial children-passthrough.
    "!src/app/layout.tsx",
  ],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};

export default config;
