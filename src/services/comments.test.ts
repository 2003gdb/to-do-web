jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "./apiClient";
import { commentsService } from "./comments";

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock; delete: jest.Mock };

beforeEach(() => jest.clearAllMocks());

describe("commentsService", () => {
  it("list -> GET /todos/:id/comments", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    await commentsService.list("t1");
    expect(mockedApi.get).toHaveBeenCalledWith("/todos/t1/comments");
  });
  it("create -> POST /todos/:id/comments with { content }", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "c1" } });
    await commentsService.create("t1", "hi");
    expect(mockedApi.post).toHaveBeenCalledWith("/todos/t1/comments", { content: "hi" });
  });
  it("remove -> DELETE /todos/:id/comments/:cid", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: null });
    await expect(commentsService.remove("t1", "c1")).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith("/todos/t1/comments/c1");
  });
});
