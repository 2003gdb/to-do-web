"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { TodoRow } from "@/components/todos/TodoRow";
import { useCategory } from "@/hooks/queries/useCategories";
import { useDeleteCategory } from "@/hooks/mutations/useCategoryMutations";
import { useTodos } from "@/hooks/queries/useTodos";
import { errorMessage } from "@/utils/errorMessage";

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const { data: category, isLoading, error, refetch } = useCategory(id);
  const { data: todos = [] } = useTodos();
  const deleteMut = useDeleteCategory();

  const related = useMemo(
    () => todos.filter((t) => t.categories?.some((c) => c.id === id)),
    [todos, id]
  );

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this list?")) return;
    try {
      await deleteMut.mutateAsync(id);
      router.replace("/categories");
    } catch (err) {
      alert(errorMessage(err, "Could not delete"));
    }
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorState message={errorMessage(error, "Could not load list")} onRetry={() => refetch()} />
    );
  if (!category) return <EmptyState title="List not found" />;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader backHref="/categories" />

      <div className="px-5">
        <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
        {category.description ? (
          <p className="mt-1 text-sm text-neutral-500">{category.description}</p>
        ) : null}
        <p className="mt-2 text-xs text-neutral-500">
          {related.length} task{related.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="px-5">
        <Button
          label="Delete list"
          variant="secondary"
          loading={deleteMut.isPending}
          loadingLabel="Deleting…"
          onClick={handleDelete}
        />
      </div>

      <div className="px-5">
        {related.length === 0 ? (
          <EmptyState title="No tasks in this list yet" />
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white">
            {related.map((t, i) => (
              <div key={t.id}>
                {i > 0 ? <div className="mx-4 h-px bg-neutral-100" /> : null}
                <TodoRow todo={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
