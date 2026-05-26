import { useQuery } from "@tanstack/react-query";
import { todosService } from "@/services/todos";

export const todosKeys = {
  all: ["todos"] as const,
  detail: (id: string) => ["todos", id] as const,
  comments: (id: string) => ["todos", id, "comments"] as const,
};

export function useTodos() {
  return useQuery({
    queryKey: todosKeys.all,
    queryFn: todosService.list,
    staleTime: 30_000,
  });
}

export function useTodo(id: string | undefined) {
  return useQuery({
    queryKey: id ? todosKeys.detail(id) : ["todos", "noop"],
    queryFn: () => todosService.get(id as string),
    enabled: Boolean(id),
  });
}
