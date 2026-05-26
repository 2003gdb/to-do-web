"use client";

import { useParams, useRouter } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
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

  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorState message={errorMessage(error, "Could not load todo")} onRetry={() => refetch()} />
    );
  if (!todo) return <ErrorState message="Todo not found" />;

  const handleToggle = () =>
    updateMut.mutate({ completed: !todo.completed });

  const handleDelete = async () => {
    if (!confirm("Delete this todo?")) return;
    try {
      await deleteMut.mutateAsync(todo.id);
      router.replace("/home");
    } catch (err) {
      alert(errorMessage(err, "Could not delete"));
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader backHref="/home" />

      <div className="flex flex-col gap-4 px-5">
        <Card dark>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-white/60">TODO</span>
            {todo.priority ? <Pill label={todo.priority} tone="dark" /> : null}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">{todo.title}</h1>
          {todo.description ? (
            <p className="text-sm leading-5 text-white/70">{todo.description}</p>
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
        </Card>

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
          <Button
            label="Delete"
            variant="secondary"
            loading={deleteMut.isPending}
            loadingLabel="…"
            onClick={handleDelete}
          />
        </div>

        <Card>
          {todo.owner ? (
            <div className="mb-3">
              <p className="text-xs text-neutral-500">OWNER</p>
              <p className="mt-0.5 text-base text-neutral-900">{todo.owner.fullName}</p>
              <p className="text-sm text-neutral-500">{todo.owner.email}</p>
            </div>
          ) : null}
          <div className="mb-3">
            <p className="text-xs text-neutral-500">CREATED</p>
            <p className="mt-0.5 text-base text-neutral-900">
              {formatDateTime(todo.createdAt)}
            </p>
          </div>
          {todo.updatedAt ? (
            <div>
              <p className="text-xs text-neutral-500">UPDATED</p>
              <p className="mt-0.5 text-base text-neutral-900">
                {formatDateTime(todo.updatedAt)}
              </p>
            </div>
          ) : null}
        </Card>

        <Card>
          <TodoCategoriesEditor todoId={todo.id} attached={todo.categories ?? []} />
        </Card>

        <Card>
          <CommentsSection todoId={todo.id} />
        </Card>
      </div>
    </div>
  );
}
