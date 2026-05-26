import { useQuery } from "@tanstack/react-query";
import { commentsService } from "@/services/comments";
import { todosKeys } from "./useTodos";

export function useComments(todoId: string | undefined) {
  return useQuery({
    queryKey: todoId ? todosKeys.comments(todoId) : ["todos", "noop", "comments"],
    queryFn: () => commentsService.list(todoId as string),
    enabled: Boolean(todoId),
  });
}
