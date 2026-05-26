import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsService } from "@/services/comments";
import { todosKeys } from "@/hooks/queries/useTodos";

export function useAddComment(todoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsService.create(todoId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.comments(todoId) }),
  });
}

export function useDeleteComment(todoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsService.remove(todoId, commentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.comments(todoId) }),
  });
}
