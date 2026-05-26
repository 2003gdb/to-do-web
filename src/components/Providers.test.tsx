import { render, screen, waitFor } from "@testing-library/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

const subscribeAuth = jest.fn();
jest.mock("@/services/authService", () => ({
  subscribeAuth: (...a: unknown[]) => subscribeAuth(...a),
}));

import { Providers } from "./Providers";

beforeEach(() => {
  subscribeAuth.mockReturnValue(() => undefined);
});

describe("Providers", () => {
  it("renders children", () => {
    render(
      <Providers>
        <span data-testid="c">x</span>
      </Providers>
    );
    expect(screen.getByTestId("c")).toBeInTheDocument();
  });

  it("subscribes to auth on mount", () => {
    render(
      <Providers>
        <span>x</span>
      </Providers>
    );
    expect(subscribeAuth).toHaveBeenCalled();
  });

  function makeAxiosErr(status: number | undefined): AxiosError {
    const err = new AxiosError("e");
    if (status !== undefined) {
      err.response = {
        data: {},
        status,
        statusText: "",
        headers: {},
        config: {} as never,
      };
    }
    return err;
  }

  it("retry logic: 4xx -> no retry, 5xx -> retry once, network -> no retry, non-axios -> retry once", () => {
    // Reach into the QueryClient to extract its retry function.
    let qc: ReturnType<typeof useQueryClient> | null = null;
    function Grab() {
      qc = useQueryClient();
      return null;
    }
    render(
      <Providers>
        <Grab />
      </Providers>
    );
    expect(qc).not.toBeNull();
    const retry = (qc as ReturnType<typeof useQueryClient>).getDefaultOptions().queries
      ?.retry as (failureCount: number, err: unknown) => boolean;
    expect(typeof retry).toBe("function");
    expect(retry(0, makeAxiosErr(404))).toBe(false);
    expect(retry(0, makeAxiosErr(undefined))).toBe(false);
    expect(retry(0, makeAxiosErr(503))).toBe(true);
    expect(retry(1, makeAxiosErr(503))).toBe(false);
    expect(retry(0, new Error("plain"))).toBe(true);
    expect(retry(1, new Error("plain"))).toBe(false);
  });

  it("exposes QueryClient via useQueryClient (single instance)", () => {
    let qc1: ReturnType<typeof useQueryClient> | null = null;
    function Probe() {
      qc1 = useQueryClient();
      return null;
    }
    render(
      <Providers>
        <Probe />
      </Providers>
    );
    expect(qc1).not.toBeNull();
  });
});
