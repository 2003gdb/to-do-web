import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const listCategories = jest.fn();
const attach = jest.fn();
const detach = jest.fn();

jest.mock("@/services/categories", () => ({
  categoriesService: { list: (...a: unknown[]) => listCategories(...a) },
}));
jest.mock("@/services/todos", () => ({
  todosService: {
    attachCategory: (...a: unknown[]) => attach(...a),
    detachCategory: (...a: unknown[]) => detach(...a),
  },
}));

import { TodoCategoriesEditor } from "./TodoCategoriesEditor";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TodoCategoriesEditor", () => {
  it("renders empty hint when no categories", async () => {
    listCategories.mockResolvedValueOnce([]);
    withClient(<TodoCategoriesEditor todoId="t" attached={[]} />);
    await waitFor(() => expect(screen.getByText("No lists yet.")).toBeInTheDocument());
  });

  it("renders chips and marks attached ones selected", async () => {
    listCategories.mockResolvedValueOnce([
      { id: "c1", name: "Work" },
      { id: "c2", name: "Home" },
    ]);
    withClient(
      <TodoCategoriesEditor
        todoId="t"
        attached={[{ id: "c1", name: "Work" }]}
      />
    );
    await waitFor(() => expect(screen.getByText("#Work")).toBeInTheDocument());
    const work = screen.getByRole("button", { name: "#Work" });
    expect(work.className).toMatch(/bg-accent/);
  });

  it("clicking unattached chip calls attachCategory", async () => {
    listCategories.mockResolvedValueOnce([{ id: "c1", name: "Work" }]);
    attach.mockResolvedValueOnce(undefined);
    withClient(<TodoCategoriesEditor todoId="t" attached={[]} />);
    const chip = await screen.findByRole("button", { name: "#Work" });
    fireEvent.click(chip);
    await waitFor(() => expect(attach).toHaveBeenCalledWith("t", "c1"));
  });

  it("clicking attached chip calls detachCategory", async () => {
    listCategories.mockResolvedValueOnce([{ id: "c1", name: "Work" }]);
    detach.mockResolvedValueOnce(undefined);
    withClient(
      <TodoCategoriesEditor todoId="t" attached={[{ id: "c1", name: "Work" }]} />
    );
    const chip = await screen.findByRole("button", { name: "#Work" });
    fireEvent.click(chip);
    await waitFor(() => expect(detach).toHaveBeenCalledWith("t", "c1"));
  });
});
