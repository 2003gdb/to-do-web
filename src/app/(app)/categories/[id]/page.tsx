"use client";

import { useMemo, useState } from "react";
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
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const related = useMemo(
    () => todos.filter((t) => t.categories?.some((c) => c.id === id)),
    [todos, id]
  );

  const handleDelete = async () => {
    if (!id) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleteError(null);
    try {
      await deleteMut.mutateAsync(id);
      router.replace("/categories");
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete"));
      setConfirming(false);
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
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">{category.name}</h1>
        {category.description ? (
          <p className="mt-1 text-sm text-text-muted prose-measure">{category.description}</p>
        ) : null}
        <p className="mt-2 text-xs tabular-nums text-text-muted">
          {related.length} task{related.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex items-center gap-2 px-5">
        <Button
          label={confirming ? "Confirm delete" : "Delete list"}
          variant={confirming ? "danger" : "secondary"}
          size="md"
          loading={deleteMut.isPending}
          loadingLabel="Deleting…"
          onClick={handleDelete}
        />
        {confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-xs px-1 text-xs text-text-muted outline-none transition-colors hover:text-text-primary focus-visible:shadow-[var(--shadow-focus)]"
          >
            Cancel
          </button>
        ) : null}
        {deleteError ? (
          <p className="text-sm text-danger">{deleteError}</p>
        ) : null}
      </div>

      <div className="px-5">
        {related.length === 0 ? (
          <EmptyState title="No tasks in this list yet" />
        ) : (
          <ul className="border-t border-border-subtle">
            {related.map((t) => (
              <li key={t.id} className="border-b border-border-subtle">
                <TodoRow todo={t} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
