import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories";
import type { CreateCategoryDto } from "@/types/todo";
import { categoriesKeys } from "@/hooks/queries/useCategories";

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesKeys.all }),
  });
}
