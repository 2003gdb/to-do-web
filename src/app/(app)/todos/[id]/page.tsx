"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Pill } from "@/components/ds/Pill";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { TodoCategoriesEditor } from "@/components/todos/TodoCategoriesEditor";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useTodo } from "@/hooks/queries/useTodos";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/mutations/useTodoMutations";
import { formatDateTime } from "@/utils/formatDate";
import { errorMessage } from "@/utils/errorMessage";

export default function TodoDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const { data: todo, isLoading, error, refetch } = useTodo(id);
  const updateMut = useUpdateTodo(id ?? "");
  const deleteMut = useDeleteTodo();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorState message={errorMessage(error, "Could not load todo")} onRetry={() => refetch()} />
    );
  if (!todo) return <ErrorState message="Todo not found" />;

  const handleToggle = () => updateMut.mutate({ completed: !todo.completed });

  const handleDeleteRequest = () => {
    setDeleteError(null);
    setConfirmingDelete(true);
  };

  const handleDeleteCancel = () => {
    setConfirmingDelete(false);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMut.mutateAsync(todo.id);
      router.replace("/home");
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete"));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader backHref="/home" />

      <div className="flex flex-col gap-6 px-5">
        {/* Hero: the single retained card */}
        <section
          className="rounded-lg bg-text-primary p-6 text-surface"
          aria-label="Todo summary"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs opacity-70">todo</span>
            {todo.priority ? <Pill label={todo.priority} tone="dark" /> : null}
          </div>
          <h1 className="mb-2 text-xl font-semibold tracking-tight">{todo.title}</h1>
          {todo.description ? (
            <p className="text-sm leading-5 opacity-80 prose-measure">{todo.description}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Pill
              label={todo.completed ? "Completed" : "Pending"}
              tone={todo.completed ? "success" : "default"}
              dot
            />
            {todo.dueDate ? (
              <Pill label={`Due ${formatDateTime(todo.dueDate)}`} tone="accent" />
            ) : null}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {deleteError ? (
            <div
              role="alert"
              className="rounded-sm border border-danger bg-danger-muted px-3 py-2 text-sm text-danger"
            >
              {deleteError}
            </div>
          ) : null}
          <div className="flex gap-3">
            <Button
              label={todo.completed ? "Mark pending" : "Mark done"}
              loading={updateMut.isPending}
              loadingLabel="Saving…"
              onClick={handleToggle}
              icon={todo.completed ? <RotateCcw size={16} /> : <Check size={16} />}
              iconRight
              className="flex-1"
            />
            {confirmingDelete ? (
              <>
                <Button
                  label="Confirm delete"
                  variant="secondary"
                  loading={deleteMut.isPending}
                  loadingLabel="Deleting…"
                  onClick={handleDeleteConfirm}
                />
                <Button
                  label="Cancel"
                  variant="secondary"
                  onClick={handleDeleteCancel}
                  disabled={deleteMut.isPending}
                />
              </>
            ) : (
              <Button label="Delete" variant="secondary" onClick={handleDeleteRequest} />
            )}
          </div>
        </div>

        {/* Meta: inline definition list, no card */}
        <dl className="grid grid-cols-1 gap-3 border-t border-border-subtle pt-5 sm:grid-cols-3">
          {todo.owner ? (
            <div>
              <dt className="text-xs text-text-muted">Owner</dt>
              <dd className="mt-1 text-sm text-text-primary">
                {todo.owner.fullName}
              </dd>
              <dd className="text-xs text-text-muted">{todo.owner.email}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs text-text-muted">Created</dt>
            <dd className="mt-1 text-sm tabular-nums text-text-primary">
              {formatDateTime(todo.createdAt)}
            </dd>
          </div>
          {todo.updatedAt ? (
            <div>
              <dt className="text-xs text-text-muted">Updated</dt>
              <dd className="mt-1 text-sm tabular-nums text-text-primary">
                {formatDateTime(todo.updatedAt)}
              </dd>
            </div>
          ) : null}
        </dl>

        {/* Lists: labeled section, no card */}
        <section className="border-t border-border-subtle pt-5">
          <TodoCategoriesEditor todoId={todo.id} attached={todo.categories ?? []} />
        </section>

        {/* Comments: labeled section, no card */}
        <section className="border-t border-border-subtle pt-5">
          <CommentsSection todoId={todo.id} />
        </section>
      </div>
    </div>
  );
}
