import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const useCategoriesMock = jest.fn();
jest.mock("@/hooks/queries/useCategories", () => ({
  useCategories: () => useCategoriesMock(),
  categoriesKeys: { all: ["categories"], detail: (id: string) => ["categories", id] },
}));

const createMutateAsync = jest.fn();
const createIsPending = { current: false };
const deleteMutate = jest.fn();
const deleteIsPending = { current: false };
const deleteVariables = { current: null as string | null };

jest.mock("@/hooks/mutations/useCategoryMutations", () => ({
  useCreateCategory: () => ({
    mutateAsync: createMutateAsync,
    get isPending() {
      return createIsPending.current;
    },
  }),
  useDeleteCategory: () => ({
    mutate: deleteMutate,
    get isPending() {
      return deleteIsPending.current;
    },
    get variables() {
      return deleteVariables.current;
    },
  }),
}));

import CategoriesPage from "./page";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  useCategoriesMock.mockReset();
  createMutateAsync.mockReset();
  deleteMutate.mockReset();
  createIsPending.current = false;
  deleteIsPending.current = false;
  deleteVariables.current = null;
});

describe("CategoriesPage", () => {
  it("renders loading", () => {
    useCategoriesMock.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: jest.fn() });
    withClient(<CategoriesPage />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders error and retry", () => {
    const refetch = jest.fn();
    useCategoriesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("nope"),
      refetch,
    });
    withClient(<CategoriesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders empty state", () => {
    useCategoriesMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    withClient(<CategoriesPage />);
    expect(screen.getByText("No lists yet")).toBeInTheDocument();
  });

  it("create disabled until non-whitespace name", () => {
    useCategoriesMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    withClient(<CategoriesPage />);
    const btn = screen.getByRole("button", { name: "Add" });
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("New list name"), { target: { value: " " } });
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText("New list name"), { target: { value: "Work" } });
    expect(btn).not.toBeDisabled();
  });

  it("submits via Enter, trims, clears input", async () => {
    useCategoriesMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    createMutateAsync.mockResolvedValueOnce({ id: "1" });
    withClient(<CategoriesPage />);
    const input = screen.getByPlaceholderText("New list name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  Work  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(createMutateAsync).toHaveBeenCalledWith({ name: "Work" }));
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("shows form error on create failure", async () => {
    useCategoriesMock.mockReturnValue({ data: [], isLoading: false, error: null, refetch: jest.fn() });
    createMutateAsync.mockRejectedValueOnce(new Error("dup"));
    withClient(<CategoriesPage />);
    fireEvent.change(screen.getByPlaceholderText("New list name"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.getByText("dup")).toBeInTheDocument());
  });

  it("delete requires two clicks (confirm flow)", () => {
    useCategoriesMock.mockReturnValue({
      data: [{ id: "c1", name: "Work" }],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoriesPage />);
    const del = screen.getByRole("button", { name: "Delete list" });
    fireEvent.click(del);
    expect(deleteMutate).not.toHaveBeenCalled();
    // After first click, "Confirm" + Cancel appears
    fireEvent.click(screen.getByRole("button", { name: "Confirm delete list" }));
    expect(deleteMutate).toHaveBeenCalledWith("c1", expect.any(Object));
  });

  it("Cancel reverts confirm state", () => {
    useCategoriesMock.mockReturnValue({
      data: [{ id: "c1", name: "Work" }],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoriesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete list" })).toBeInTheDocument();
  });

  it("shows description and renders link to detail", () => {
    useCategoriesMock.mockReturnValue({
      data: [{ id: "c1", name: "Work", description: "office stuff" }],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoriesPage />);
    expect(screen.getByText("office stuff")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/categories/c1");
  });

  it("delete button shows disabled style while pending", () => {
    deleteIsPending.current = true;
    deleteVariables.current = "c1";
    useCategoriesMock.mockReturnValue({
      data: [{ id: "c1", name: "Work" }],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    withClient(<CategoriesPage />);
    expect(screen.getByRole("button", { name: "Delete list" })).toBeDisabled();
  });
});
