import { useMutation, useQueryClient } from "@tanstack/react-query";
import { todosService } from "@/services/todos";
import type { CreateTodoDto, UpdateTodoDto } from "@/types/todo";
import { todosKeys } from "@/hooks/queries/useTodos";

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTodoDto) => todosService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.all }),
  });
}

export function useUpdateTodo(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTodoDto) => todosService.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: todosKeys.all });
      qc.invalidateQueries({ queryKey: todosKeys.detail(id) });
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.all }),
  });
}

export function useAttachCategory(todoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => todosService.attachCategory(todoId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.detail(todoId) }),
  });
}

export function useDetachCategory(todoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => todosService.detachCategory(todoId, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: todosKeys.detail(todoId) }),
  });
}
