import api from "./apiClient";
import type { CreateTodoDto, Todo, UpdateTodoDto } from "@/types/todo";

export const todosService = {
  list: () => api.get<Todo[]>("/todos").then((r) => r.data),
  get: (id: string) => api.get<Todo>(`/todos/${id}`).then((r) => r.data),
  subtasks: (id: string) => api.get<Todo[]>(`/todos/${id}/tasks`).then((r) => r.data),
  create: (dto: CreateTodoDto) => api.post<Todo>("/todos", dto).then((r) => r.data),
  update: (id: string, dto: UpdateTodoDto) =>
    api.put<Todo>(`/todos/${id}`, dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/todos/${id}`).then(() => undefined),
  attachCategory: (todoId: string, categoryId: string) =>
    api.post(`/todos/${todoId}/categories/${categoryId}`).then(() => undefined),
  detachCategory: (todoId: string, categoryId: string) =>
    api.delete(`/todos/${todoId}/categories/${categoryId}`).then(() => undefined),
};
