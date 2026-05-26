import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const useTodosMock = jest.fn();
jest.mock("@/hooks/queries/useTodos", () => ({
  useTodos: () => useTodosMock(),
  todosKeys: { all: ["todos"], detail: (id: string) => ["todos", id] },
}));

import HomePage from "./page";
import { useUiStore } from "@/store/useUiStore";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  useTodosMock.mockReset();
  useUiStore.setState({ filter: "all" });
});

const baseTodos = [
  { id: "1", title: "Walk dog", description: "", completed: false, createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", title: "Pay bills", description: "this month", completed: true, createdAt: "2024-01-02T00:00:00Z" },
  { id: "3", title: "Refactor", description: "", completed: false, createdAt: "2024-01-03T00:00:00Z" },
];

describe("HomePage", () => {
  it("renders loading state", () => {
    useTodosMock.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders error state with retry", () => {
    const refetch = jest.fn();
    useTodosMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("bad"),
      refetch,
    });
    withClient(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders empty state when no todos", () => {
    useTodosMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders list and counter", () => {
    useTodosMock.mockReturnValue({ data: baseTodos, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
    // 2 pending of 3 total (Walk dog + Refactor)
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("filters: pending hides completed", () => {
    useTodosMock.mockReturnValue({ data: baseTodos, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    fireEvent.click(screen.getByRole("tab", { name: "Pending" }));
    expect(screen.queryByText("Pay bills")).toBeNull();
    expect(screen.getByText("Walk dog")).toBeInTheDocument();
  });

  it("filters: completed hides pending", () => {
    useTodosMock.mockReturnValue({ data: baseTodos, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    fireEvent.click(screen.getByRole("tab", { name: "Done" }));
    expect(screen.queryByText("Walk dog")).toBeNull();
    expect(screen.getByText("Pay bills")).toBeInTheDocument();
  });

  it("search matches title and description case-insensitively", () => {
    useTodosMock.mockReturnValue({ data: baseTodos, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    const search = screen.getByPlaceholderText("Search tasks");
    fireEvent.change(search, { target: { value: "MONTH" } });
    expect(screen.getByText("Pay bills")).toBeInTheDocument();
    expect(screen.queryByText("Walk dog")).toBeNull();
  });

  it("search empty-state mentions query", () => {
    useTodosMock.mockReturnValue({ data: baseTodos, isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("No matches")).toBeInTheDocument();
    expect(screen.getByText(/zzz/)).toBeInTheDocument();
  });

  it("FAB links to /todos/new", () => {
    useTodosMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    withClient(<HomePage />);
    expect(screen.getByRole("link", { name: "New todo" })).toHaveAttribute("href", "/todos/new");
  });
});
