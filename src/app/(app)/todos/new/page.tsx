"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { Textarea } from "@/components/ds/Textarea";
import { Chip } from "@/components/ds/Chip";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreateTodo } from "@/hooks/mutations/useTodoMutations";
import type { Priority } from "@/types/todo";
import { errorMessage } from "@/utils/errorMessage";
import { todosService } from "@/services/todos";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];
const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function NewTodoPage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const createMut = useCreateTodo();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    try {
      const created = await createMut.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      await Promise.all(selected.map((cid) => todosService.attachCategory(created.id, cid)));
      router.replace("/home");
    } catch (err) {
      setError(errorMessage(err, "Could not create todo"));
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader title="New todo" backHref="/home" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="flex flex-col gap-6 px-5"
      >
        <section className="flex flex-col gap-4 border-b border-border-subtle pb-6">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="todo-title"
              className="text-sm font-medium text-text-secondary"
            >
              Title
            </label>
            <Input
              id="todo-title"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="todo-description"
              className="text-sm font-medium text-text-secondary"
            >
              Description
            </label>
            <Textarea
              id="todo-description"
              placeholder="Add details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3 border-b border-border-subtle pb-6">
          <p className="text-sm font-medium text-text-secondary">Priority</p>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={PRIORITY_LABEL[p]}
                selected={priority === p}
                onClick={() => setPriority(priority === p ? undefined : p)}
                className="flex-1"
              />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium text-text-secondary">Lists</p>
          {categories.length === 0 ? (
            <p className="text-sm text-text-muted">
              No lists yet. Create one in the Lists tab.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  label={`#${c.name}`}
                  selected={selected.includes(c.id)}
                  onClick={() => toggleCategory(c.id)}
                />
              ))}
            </div>
          )}
        </section>

        {error ? (
          <p
            role="alert"
            className="rounded-sm bg-danger-muted px-4 py-3 text-sm font-medium text-danger"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            label="Cancel"
            variant="ghost"
            onClick={() => router.back()}
            disabled={createMut.isPending}
          />
          <Button
            label="Create"
            loading={createMut.isPending}
            loadingLabel="Creating…"
            type="submit"
            onClick={handleCreate}
          />
        </div>
      </form>
    </div>
  );
}
