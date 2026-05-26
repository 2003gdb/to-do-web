import { AxiosError } from "axios";

export function errorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof AxiosError) {
    if (!err.response) {
      if (err.code === "ECONNABORTED") return "Server took too long to respond. Try again.";
      return "Cannot reach server. Check your connection or try again later.";
    }
    const data = err.response.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
