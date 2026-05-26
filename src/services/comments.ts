import api from "./apiClient";
import type { TodoComment } from "@/types/todo";

export const commentsService = {
  list: (todoId: string) =>
    api.get<TodoComment[]>(`/todos/${todoId}/comments`).then((r) => r.data),
  create: (todoId: string, content: string) =>
    api.post<TodoComment>(`/todos/${todoId}/comments`, { content }).then((r) => r.data),
  remove: (todoId: string, commentId: string) =>
    api.delete(`/todos/${todoId}/comments/${commentId}`).then(() => undefined),
};
