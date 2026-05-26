jest.mock("./apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from "./apiClient";
import { categoriesService } from "./categories";

const mockedApi = api as unknown as { get: jest.Mock; post: jest.Mock; delete: jest.Mock };

beforeEach(() => jest.clearAllMocks());

describe("categoriesService", () => {
  it("list -> GET /categories", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    await categoriesService.list();
    expect(mockedApi.get).toHaveBeenCalledWith("/categories");
  });
  it("get -> GET /categories/:id", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: "1" } });
    await expect(categoriesService.get("1")).resolves.toEqual({ id: "1" });
    expect(mockedApi.get).toHaveBeenCalledWith("/categories/1");
  });
  it("create -> POST /categories with dto", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: "1" } });
    await categoriesService.create({ name: "x" });
    expect(mockedApi.post).toHaveBeenCalledWith("/categories", { name: "x" });
  });
  it("remove -> DELETE /categories/:id", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: null });
    await expect(categoriesService.remove("9")).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith("/categories/9");
  });
});
