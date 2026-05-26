"use client";

import { useState, type ReactNode } from "react";
import { AxiosError } from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthHydrator } from "@/hooks/useAuth";

function AuthBoot({ children }: { children: ReactNode }) {
  useAuthHydrator();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, err) => {
              if (err instanceof AxiosError) {
                const status = err.response?.status;
                if (!err.response) return false;
                if (status && status >= 400 && status < 500) return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <AuthBoot>{children}</AuthBoot>
    </QueryClientProvider>
  );
}
