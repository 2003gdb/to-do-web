import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

jest.mock("@/services/todos", () => ({
  todosService: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    attachCategory: jest.fn(),
    detachCategory: jest.fn(),
  },
}));
jest.mock("@/services/categories", () => ({
  categoriesService: {
    create: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock("@/services/comments", () => ({
  commentsService: { create: jest.fn(), remove: jest.fn() },
}));

import {
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useAttachCategory,
  useDetachCategory,
} from "./useTodoMutations";
import { useCreateCategory, useDeleteCategory } from "./useCategoryMutations";
import { useAddComment, useDeleteComment } from "./useCommentMutations";
import { todosService } from "@/services/todos";
import { categoriesService } from "@/services/categories";
import { commentsService } from "@/services/comments";
import { todosKeys } from "@/hooks/queries/useTodos";
import { categoriesKeys } from "@/hooks/queries/useCategories";

function wrapper(client: QueryClient) {
  return function W({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

const mTodos = todosService as unknown as Record<string, jest.Mock>;
const mCats = categoriesService as unknown as Record<string, jest.Mock>;
const mComm = commentsService as unknown as Record<string, jest.Mock>;

beforeEach(() => jest.clearAllMocks());

describe("todo mutations", () => {
  it("useCreateTodo invalidates todosKeys.all on success", async () => {
    mTodos.create.mockResolvedValueOnce({ id: "x" });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCreateTodo(), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync({ title: "t" });
    });
    expect(mTodos.create).toHaveBeenCalledWith({ title: "t" });
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.all });
  });

  it("useUpdateTodo invalidates both list and detail on success", async () => {
    mTodos.update.mockResolvedValueOnce({ id: "x" });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useUpdateTodo("x"), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync({ completed: true });
    });
    expect(mTodos.update).toHaveBeenCalledWith("x", { completed: true });
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.all });
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.detail("x") });
  });

  it("useDeleteTodo invalidates list", async () => {
    mTodos.remove.mockResolvedValueOnce(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDeleteTodo(), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("9");
    });
    expect(mTodos.remove).toHaveBeenCalledWith("9");
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.all });
  });

  it("useAttachCategory invalidates detail for the todo", async () => {
    mTodos.attachCategory.mockResolvedValueOnce(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAttachCategory("t"), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("c");
    });
    expect(mTodos.attachCategory).toHaveBeenCalledWith("t", "c");
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.detail("t") });
  });

  it("useDetachCategory invalidates detail", async () => {
    mTodos.detachCategory.mockResolvedValueOnce(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDetachCategory("t"), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("c");
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.detail("t") });
  });

  it("error propagates from useCreateTodo", async () => {
    mTodos.create.mockRejectedValueOnce(new Error("nope"));
    const client = createTestQueryClient();
    const { result } = renderHook(() => useCreateTodo(), { wrapper: wrapper(client) });
    await expect(result.current.mutateAsync({ title: "t" })).rejects.toThrow("nope");
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("category mutations", () => {
  it("useCreateCategory invalidates categories list", async () => {
    mCats.create.mockResolvedValueOnce({ id: "1" });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useCreateCategory(), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync({ name: "n" });
    });
    expect(mCats.create).toHaveBeenCalledWith({ name: "n" });
    expect(spy).toHaveBeenCalledWith({ queryKey: categoriesKeys.all });
  });

  it("useDeleteCategory invalidates list", async () => {
    mCats.remove.mockResolvedValueOnce(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDeleteCategory(), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("9");
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: categoriesKeys.all });
  });
});

describe("comment mutations", () => {
  it("useAddComment invalidates the todo comments key", async () => {
    mComm.create.mockResolvedValueOnce({ id: "c" });
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAddComment("t1"), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("hi");
    });
    expect(mComm.create).toHaveBeenCalledWith("t1", "hi");
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.comments("t1") });
  });

  it("useDeleteComment invalidates comments", async () => {
    mComm.remove.mockResolvedValueOnce(undefined);
    const client = createTestQueryClient();
    const spy = jest.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDeleteComment("t1"), { wrapper: wrapper(client) });
    await act(async () => {
      await result.current.mutateAsync("c1");
    });
    expect(mComm.remove).toHaveBeenCalledWith("t1", "c1");
    expect(spy).toHaveBeenCalledWith({ queryKey: todosKeys.comments("t1") });
  });
});
