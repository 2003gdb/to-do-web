"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { Textarea } from "@/components/ds/Textarea";
import { Chip } from "@/components/ds/Chip";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreateTodo, useAttachCategory } from "@/hooks/mutations/useTodoMutations";
import type { Priority } from "@/types/todo";
import { errorMessage } from "@/utils/errorMessage";
import { todosService } from "@/services/todos";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

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

      <div className="flex flex-col gap-4 px-5">
        <Card>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">TITLE</label>
          <Input
            placeholder="What needs doing?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="my-4 h-px bg-neutral-100" />
          <label className="mb-1 block text-xs font-semibold text-neutral-500">DESCRIPTION</label>
          <Textarea
            placeholder="Add details (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </Card>

        <Card>
          <p className="mb-3 text-xs font-semibold text-neutral-500">PRIORITY</p>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Chip
                key={p}
                label={p}
                selected={priority === p}
                onClick={() => setPriority(priority === p ? undefined : p)}
                className="flex-1"
              />
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-xs font-semibold text-neutral-500">LISTS</p>
          {categories.length === 0 ? (
            <p className="text-sm text-neutral-500">
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
        </Card>

        {error ? (
          <p role="alert" className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <Button
          label="Create"
          loading={createMut.isPending}
          loadingLabel="Creating…"
          onClick={handleCreate}
          fullWidth
        />
        <Button
          label="Cancel"
          variant="ghost"
          onClick={() => router.back()}
          disabled={createMut.isPending}
          fullWidth
        />
      </div>
    </div>
  );
}
