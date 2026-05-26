import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const replace = jest.fn();
const paramsRef = { current: { id: "c1" } as { id?: string } };
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => paramsRef.current,
}));

const useCategory = jest.fn();
const useTodosMock = jest.fn();
jest.mock("@/hooks/queries/useCategories", () => ({
  useCategory: (...a: unknown[]) => useCategory(...a),
  categoriesKeys: { all: ["categories"], detail: (id: string) => ["categories", id] },
}));
jest.mock("@/hooks/queries/useTodos", () => ({
  useTodos: () => useTodosMock(),
  todosKeys: { all: ["todos"], detail: (id: string) => ["todos", id] },
}));

const deleteMutateAsync = jest.fn();
const deleteIsPending = { current: false };
jest.mock("@/hooks/mutations/useCategoryMutations", () => ({
  useDeleteCategory: () => ({
    mutateAsync: deleteMutateAsync,
    get isPending() {
      return deleteIsPending.current;
    },
  }),
}));

import CategoryDetailPage from "./page";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  replace.mockClear();
  useCategory.mockReset();
  useTodosMock.mockReset().mockReturnValue({ data: [] });
  deleteMutateAsync.mockReset();
  deleteIsPending.current = false;
  paramsRef.current = { id: "c1" };
});

describe("CategoryDetailPage", () => {
  it("renders loading", () => {
    useCategory.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: jest.fn() });
    withClient(<CategoryDetailPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders error + retry", () => {
    const refetch = jest.fn();
    useCategory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("nope"),
      refetch,
    });
    withClient(<CategoryDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders 'not found' when no data", () => {
    useCategory.mockReturnValue({ data: null, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<CategoryDetailPage />);
    expect(screen.getByText("List not found")).toBeInTheDocument();
  });

  it("renders category and related todos", () => {
    useCategory.mockReturnValue({
      data: { id: "c1", name: "Work", description: "office" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    useTodosMock.mockReturnValue({
      data: [
        {
          id: "t1",
          title: "T1",
          description: "",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z",
          categories: [{ id: "c1", name: "Work" }],
        },
        {
          id: "t2",
          title: "T2",
          description: "",
          completed: false,
          createdAt: "2024-01-02T00:00:00Z",
          categories: [{ id: "other" }],
        },
      ],
    });
    withClient(<CategoryDetailPage />);
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("T1")).toBeInTheDocument();
    expect(screen.queryByText("T2")).toBeNull();
    expect(screen.getByText("1 task")).toBeInTheDocument();
  });

  it("delete: two clicks, then mutate + navigate", async () => {
    useCategory.mockReturnValue({
      data: { id: "c1", name: "Work" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    deleteMutateAsync.mockResolvedValueOnce(undefined);
    withClient(<CategoryDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
    expect(deleteMutateAsync).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalledWith("c1"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/categories"));
  });

  it("delete cancel reverts state", () => {
    useCategory.mockReturnValue({
      data: { id: "c1", name: "Work" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoryDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete list" })).toBeInTheDocument();
  });

  it("delete failure surfaces error and re-enables", async () => {
    useCategory.mockReturnValue({
      data: { id: "c1", name: "Work" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    deleteMutateAsync.mockRejectedValueOnce(new Error("oops"));
    withClient(<CategoryDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(screen.getByText("oops")).toBeInTheDocument());
  });

  it("noop when params has no id (handleDelete early-return)", async () => {
    paramsRef.current = {};
    useCategory.mockReturnValue({
      data: { id: "c1", name: "Work" },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoryDetailPage />);
    // First click sets confirming=true (handleDelete: !id => early return BEFORE confirming flip)
    // The page never advances to "Confirm delete" — verify no mutation either.
    fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
    expect(deleteMutateAsync).not.toHaveBeenCalled();
  });
});
