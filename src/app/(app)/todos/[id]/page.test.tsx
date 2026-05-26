import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const replace = jest.fn();
const paramsRef = { current: { id: "t1" } as { id?: string } };
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useParams: () => paramsRef.current,
}));

const useTodoMock = jest.fn();
const useTodosMock = jest.fn(() => ({ data: [] }));
jest.mock("@/hooks/queries/useTodos", () => ({
  useTodo: () => useTodoMock(),
  useTodos: () => useTodosMock(),
  todosKeys: { all: ["todos"], detail: (id: string) => ["todos", id], comments: (id: string) => ["todos", id, "comments"] },
}));

const updateMutate = jest.fn();
const updateIsPending = { current: false };
const deleteMutateAsync = jest.fn();
const deleteIsPending = { current: false };
jest.mock("@/hooks/mutations/useTodoMutations", () => ({
  useUpdateTodo: () => ({
    mutate: updateMutate,
    get isPending() {
      return updateIsPending.current;
    },
  }),
  useDeleteTodo: () => ({
    mutateAsync: deleteMutateAsync,
    get isPending() {
      return deleteIsPending.current;
    },
  }),
  useAttachCategory: () => ({ mutate: jest.fn(), isPending: false }),
  useDetachCategory: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/hooks/queries/useCategories", () => ({
  useCategories: () => ({ data: [] }),
  categoriesKeys: { all: ["categories"], detail: (id: string) => ["categories", id] },
}));

jest.mock("@/hooks/queries/useComments", () => ({
  useComments: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
}));
jest.mock("@/hooks/mutations/useCommentMutations", () => ({
  useAddComment: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useDeleteComment: () => ({ mutate: jest.fn(), isPending: false }),
}));

import TodoDetailPage from "./page";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const baseTodo = {
  id: "t1",
  title: "Read book",
  description: "the good one",
  completed: false,
  createdAt: "2024-01-01T00:00:00Z",
  priority: "HIGH",
  dueDate: "2024-12-31T12:00:00Z",
  owner: { fullName: "Alice", email: "a@b" },
  updatedAt: "2024-01-02T00:00:00Z",
  categories: [],
};

beforeEach(() => {
  replace.mockClear();
  useTodoMock.mockReset();
  updateMutate.mockReset();
  deleteMutateAsync.mockReset();
  updateIsPending.current = false;
  deleteIsPending.current = false;
  paramsRef.current = { id: "t1" };
});

describe("TodoDetailPage", () => {
  it("loading", () => {
    useTodoMock.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: jest.fn() });
    withClient(<TodoDetailPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("error + retry", () => {
    const refetch = jest.fn();
    useTodoMock.mockReturnValue({ data: undefined, isLoading: false, error: new Error("nope"), refetch });
    withClient(<TodoDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("not found when data null", () => {
    useTodoMock.mockReturnValue({ data: null, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<TodoDetailPage />);
    expect(screen.getByText("Todo not found")).toBeInTheDocument();
  });

  it("renders todo and toggles via 'Mark done'", () => {
    useTodoMock.mockReturnValue({ data: baseTodo, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<TodoDetailPage />);
    expect(screen.getByText("Read book")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Mark done/ }));
    expect(updateMutate).toHaveBeenCalledWith({ completed: true });
  });

  it("Mark pending when completed", () => {
    useTodoMock.mockReturnValue({
      data: { ...baseTodo, completed: true },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<TodoDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: /Mark pending/ }));
    expect(updateMutate).toHaveBeenCalledWith({ completed: false });
  });

  it("delete flow: request -> confirm -> navigate", async () => {
    useTodoMock.mockReturnValue({ data: baseTodo, isLoading: false, error: null, refetch: jest.fn() });
    deleteMutateAsync.mockResolvedValueOnce(undefined);
    withClient(<TodoDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(deleteMutateAsync).toHaveBeenCalledWith("t1"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  it("delete cancel returns to base state", () => {
    useTodoMock.mockReturnValue({ data: baseTodo, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<TodoDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("delete failure surfaces error", async () => {
    useTodoMock.mockReturnValue({ data: baseTodo, isLoading: false, error: null, refetch: jest.fn() });
    deleteMutateAsync.mockRejectedValueOnce(new Error("boom"));
    withClient(<TodoDetailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));
    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
  });

  it("renders without priority/dueDate/owner/updatedAt", () => {
    useTodoMock.mockReturnValue({
      data: {
        id: "t1",
        title: "Plain",
        description: "",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
        categories: [],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<TodoDetailPage />);
    expect(screen.getByText("Plain")).toBeInTheDocument();
    expect(screen.queryByText("Owner")).toBeNull();
  });
});
