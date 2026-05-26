import api from "./apiClient";
import type { CreateCategoryDto, TodoCategory } from "@/types/todo";

export const categoriesService = {
  list: () => api.get<TodoCategory[]>("/categories").then((r) => r.data),
  get: (id: string) => api.get<TodoCategory>(`/categories/${id}`).then((r) => r.data),
  create: (dto: CreateCategoryDto) =>
    api.post<TodoCategory>("/categories", dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`).then(() => undefined),
};
