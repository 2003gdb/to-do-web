import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test-utils/createTestQueryClient";

const listComments = jest.fn();
const createComment = jest.fn();
const removeComment = jest.fn();

jest.mock("@/services/comments", () => ({
  commentsService: {
    list: (...a: unknown[]) => listComments(...a),
    create: (...a: unknown[]) => createComment(...a),
    remove: (...a: unknown[]) => removeComment(...a),
  },
}));

import { CommentsSection } from "./CommentsSection";

function withClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CommentsSection", () => {
  it("shows loading then empty state", async () => {
    listComments.mockResolvedValueOnce([]);
    withClient(<CommentsSection todoId="t" />);
    await waitFor(() =>
      expect(screen.getByText("No comments yet.")).toBeInTheDocument()
    );
  });

  it("renders error state with retry", async () => {
    listComments.mockRejectedValueOnce(new Error("boom"));
    withClient(<CommentsSection todoId="t" />);
    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("renders comments list", async () => {
    listComments.mockResolvedValueOnce([
      { id: "c1", content: "hello", createdAt: "2024-01-01T12:00:00Z", authorEmail: "a@b" },
    ]);
    withClient(<CommentsSection todoId="t" />);
    expect(await screen.findByText("hello")).toBeInTheDocument();
    expect(screen.getByText(/a@b/)).toBeInTheDocument();
  });

  it("post button is disabled until non-whitespace text", async () => {
    listComments.mockResolvedValueOnce([]);
    withClient(<CommentsSection todoId="t" />);
    const post = await screen.findByRole("button", { name: "Post" });
    expect(post).toBeDisabled();
    const input = screen.getByPlaceholderText("Write a comment…");
    fireEvent.change(input, { target: { value: "   " } });
    expect(post).toBeDisabled();
    fireEvent.change(input, { target: { value: "hi" } });
    expect(post).not.toBeDisabled();
  });

  it("submits trimmed comment on Enter, clears input on success", async () => {
    listComments.mockResolvedValueOnce([]);
    createComment.mockResolvedValueOnce({ id: "c1" });
    withClient(<CommentsSection todoId="t" />);
    const input = (await screen.findByPlaceholderText(
      "Write a comment…"
    )) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  msg  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(createComment).toHaveBeenCalledWith("t", "msg"));
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("does not submit when text is only whitespace", async () => {
    listComments.mockResolvedValueOnce([]);
    withClient(<CommentsSection todoId="t" />);
    const input = await screen.findByPlaceholderText("Write a comment…");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(createComment).not.toHaveBeenCalled();
  });

  it("shows error alert on add failure", async () => {
    listComments.mockResolvedValueOnce([]);
    createComment.mockRejectedValueOnce(new Error("nope"));
    withClient(<CommentsSection todoId="t" />);
    const input = await screen.findByPlaceholderText("Write a comment…");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("nope"));
  });

  it("delete button calls remove", async () => {
    listComments.mockResolvedValueOnce([
      { id: "c1", content: "x", createdAt: "2024-01-01T12:00:00Z", authorEmail: "a" },
    ]);
    removeComment.mockResolvedValueOnce(undefined);
    withClient(<CommentsSection todoId="t" />);
    const del = await screen.findByRole("button", { name: "Delete comment" });
    fireEvent.click(del);
    await waitFor(() => expect(removeComment).toHaveBeenCalledWith("t", "c1"));
  });
});
