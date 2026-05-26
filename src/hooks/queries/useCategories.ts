import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories";

export const categoriesKeys = {
  all: ["categories"] as const,
  detail: (id: string) => ["categories", id] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoriesKeys.all,
    queryFn: categoriesService.list,
    staleTime: 60_000,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: id ? categoriesKeys.detail(id) : ["categories", "noop"],
    queryFn: () => categoriesService.get(id as string),
    enabled: Boolean(id),
  });
}
