jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "./apiClient";
import { todosService } from "./todos";

const mockedApi = api as unknown as {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("todosService", () => {
  it("list -> GET /todos and unwraps data", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: "1" }] });
    await expect(todosService.list()).resolves.toEqual([{ id: "1" }]);
    expect(mockedApi.get).toHaveBeenCalledWith("/todos");
  });

  it("get -> GET /todos/:id", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: "9" } });
    await expect(todosService.get("9")).resolves.toEqual({ id: "9" });
    expect(mockedApi.get).toHaveBeenCalledWith("/todos/9");
  });

  it("subtasks -> GET /todos/:id/tasks", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    await todosService.subtasks("9");
    expect(mockedApi.get).toHaveBeenCalledWith("/todos/9/tasks");
  });

  it("create -> POST /todos with dto", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "x" } });
    const out = await todosService.create({ title: "t" });
    expect(mockedApi.post).toHaveBeenCalledWith("/todos", { title: "t" });
    expect(out).toEqual({ id: "x" });
  });

  it("update -> PUT /todos/:id with dto", async () => {
    mockedApi.put.mockResolvedValueOnce({ data: {} });
    await todosService.update("3", { completed: true });
    expect(mockedApi.put).toHaveBeenCalledWith("/todos/3", { completed: true });
  });

  it("remove -> DELETE /todos/:id resolves undefined", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: null });
    await expect(todosService.remove("3")).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith("/todos/3");
  });

  it("attachCategory -> POST /todos/:tid/categories/:cid", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: null });
    await expect(todosService.attachCategory("t", "c")).resolves.toBeUndefined();
    expect(mockedApi.post).toHaveBeenCalledWith("/todos/t/categories/c");
  });

  it("detachCategory -> DELETE /todos/:tid/categories/:cid", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: null });
    await expect(todosService.detachCategory("t", "c")).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith("/todos/t/categories/c");
  });

  it("propagates errors from api", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("boom"));
    await expect(todosService.list()).rejects.toThrow("boom");
  });
});
