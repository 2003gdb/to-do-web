import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "./createTestQueryClient";

type Options = Omit<RenderOptions, "wrapper"> & { client?: QueryClient };

export function renderWithProviders(ui: ReactElement, options: Options = {}) {
  const client = options.client ?? createTestQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
}
