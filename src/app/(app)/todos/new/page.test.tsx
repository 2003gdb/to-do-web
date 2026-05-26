import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const replace = jest.fn();
const back = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace, back }) }));

const useCategoriesMock = jest.fn();
jest.mock("@/hooks/queries/useCategories", () => ({
  useCategories: () => useCategoriesMock(),
  categoriesKeys: { all: ["categories"], detail: (id: string) => ["categories", id] },
}));

const createMutateAsync = jest.fn();
const createIsPending = { current: false };
jest.mock("@/hooks/mutations/useTodoMutations", () => ({
  useCreateTodo: () => ({
    mutateAsync: createMutateAsync,
    get isPending() {
      return createIsPending.current;
    },
  }),
}));

const attach = jest.fn();
jest.mock("@/services/todos", () => ({
  todosService: { attachCategory: (...a: unknown[]) => attach(...a) },
}));

import NewTodoPage from "./page";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  replace.mockClear();
  back.mockClear();
  useCategoriesMock.mockReset().mockReturnValue({ data: [] });
  createMutateAsync.mockReset();
  attach.mockReset();
  createIsPending.current = false;
});

describe("NewTodoPage", () => {
  it("validates that title is required", () => {
    withClient(<NewTodoPage />);
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required");
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it("submits trimmed title and undefined empty description", async () => {
    createMutateAsync.mockResolvedValueOnce({ id: "1" });
    withClient(<NewTodoPage />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "  Do x  " } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: "Do x",
        description: undefined,
        priority: undefined,
      })
    );
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
  });

  it("toggles priority chips and clears via second click", () => {
    withClient(<NewTodoPage />);
    fireEvent.click(screen.getByRole("button", { name: "High" }));
    expect(screen.getByRole("button", { name: "High" }).className).toMatch(/bg-accent/);
    fireEvent.click(screen.getByRole("button", { name: "High" }));
    expect(screen.getByRole("button", { name: "High" }).className).not.toMatch(/bg-accent/);
  });

  it("attaches selected categories after create", async () => {
    useCategoriesMock.mockReturnValue({
      data: [
        { id: "c1", name: "Work" },
        { id: "c2", name: "Home" },
      ],
    });
    createMutateAsync.mockResolvedValueOnce({ id: "t1" });
    attach.mockResolvedValue(undefined);
    withClient(<NewTodoPage />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Buy" } });
    fireEvent.click(screen.getByRole("button", { name: "#Work" }));
    fireEvent.click(screen.getByRole("button", { name: "#Home" }));
    // Unselect Home, keep Work
    fireEvent.click(screen.getByRole("button", { name: "#Home" }));
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => expect(attach).toHaveBeenCalledWith("t1", "c1"));
    expect(attach).toHaveBeenCalledTimes(1);
  });

  it("shows error message on create failure", async () => {
    createMutateAsync.mockRejectedValueOnce(new Error("server"));
    withClient(<NewTodoPage />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("server"));
  });

  it("Cancel triggers router.back", () => {
    withClient(<NewTodoPage />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(back).toHaveBeenCalled();
  });

  it("hint text when no categories", () => {
    withClient(<NewTodoPage />);
    expect(screen.getByText(/No lists yet/)).toBeInTheDocument();
  });

  it("submitting via form (Enter on description not handled; submit button works)", async () => {
    createMutateAsync.mockResolvedValueOnce({ id: "1" });
    withClient(<NewTodoPage />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "  desc  " } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: "x",
        description: "desc",
        priority: undefined,
      })
    );
  });
});
