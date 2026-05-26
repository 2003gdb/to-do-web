import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

jest.mock("@/services/todos", () => ({
  todosService: {
    list: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock("@/services/categories", () => ({
  categoriesService: {
    list: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock("@/services/comments", () => ({
  commentsService: { list: jest.fn() },
}));

import { useTodos, useTodo, todosKeys } from "./useTodos";
import { useCategories, useCategory, categoriesKeys } from "./useCategories";
import { useComments } from "./useComments";
import { todosService } from "@/services/todos";
import { categoriesService } from "@/services/categories";
import { commentsService } from "@/services/comments";

function wrapper(client: QueryClient) {
  return function W({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const mockTodos = todosService as unknown as { list: jest.Mock; get: jest.Mock };
const mockCats = categoriesService as unknown as { list: jest.Mock; get: jest.Mock };
const mockComm = commentsService as unknown as { list: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useTodos / useTodo", () => {
  it("useTodos resolves with data on success", async () => {
    mockTodos.list.mockResolvedValueOnce([{ id: "1" }]);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useTodos(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "1" }]);
  });

  it("useTodos exposes error on failure", async () => {
    mockTodos.list.mockRejectedValueOnce(new Error("nope"));
    const client = createTestQueryClient();
    const { result } = renderHook(() => useTodos(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("nope");
  });

  it("useTodo is disabled when id is undefined", () => {
    const client = createTestQueryClient();
    renderHook(() => useTodo(undefined), { wrapper: wrapper(client) });
    expect(mockTodos.get).not.toHaveBeenCalled();
  });

  it("useTodo fetches when id is set", async () => {
    mockTodos.get.mockResolvedValueOnce({ id: "x" });
    const client = createTestQueryClient();
    const { result } = renderHook(() => useTodo("x"), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockTodos.get).toHaveBeenCalledWith("x");
    expect(result.current.data).toEqual({ id: "x" });
  });

  it("query keys are stable", () => {
    expect(todosKeys.all).toEqual(["todos"]);
    expect(todosKeys.detail("9")).toEqual(["todos", "9"]);
    expect(todosKeys.comments("9")).toEqual(["todos", "9", "comments"]);
  });
});

describe("useCategories / useCategory", () => {
  it("useCategories fetches list", async () => {
    mockCats.list.mockResolvedValueOnce([{ id: "c" }]);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useCategories(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("useCategory disabled when no id", () => {
    const client = createTestQueryClient();
    renderHook(() => useCategory(undefined), { wrapper: wrapper(client) });
    expect(mockCats.get).not.toHaveBeenCalled();
  });

  it("useCategory fetches when id present", async () => {
    mockCats.get.mockResolvedValueOnce({ id: "c" });
    const client = createTestQueryClient();
    const { result } = renderHook(() => useCategory("c"), {
      wrapper: wrapper(client),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCats.get).toHaveBeenCalledWith("c");
  });

  it("category keys are stable", () => {
    expect(categoriesKeys.all).toEqual(["categories"]);
    expect(categoriesKeys.detail("z")).toEqual(["categories", "z"]);
  });
});

describe("useComments", () => {
  it("disabled when no todoId", () => {
    const client = createTestQueryClient();
    renderHook(() => useComments(undefined), { wrapper: wrapper(client) });
    expect(mockComm.list).not.toHaveBeenCalled();
  });

  it("fetches when todoId is set", async () => {
    mockComm.list.mockResolvedValueOnce([{ id: "c1", content: "hi" }]);
    const client = createTestQueryClient();
    const { result } = renderHook(() => useComments("t1"), {
      wrapper: wrapper(client),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockComm.list).toHaveBeenCalledWith("t1");
  });
});
