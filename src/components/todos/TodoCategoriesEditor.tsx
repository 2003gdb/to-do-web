"use client";

import { Chip } from "@/components/ds/Chip";
import { useCategories } from "@/hooks/queries/useCategories";
import { useAttachCategory, useDetachCategory } from "@/hooks/mutations/useTodoMutations";
import type { TodoCategory } from "@/types/todo";

type Props = {
  todoId: string;
  attached: TodoCategory[];
};

export function TodoCategoriesEditor({ todoId, attached }: Props) {
  const { data: all = [] } = useCategories();
  const attachMut = useAttachCategory(todoId);
  const detachMut = useDetachCategory(todoId);
  const attachedIds = new Set(attached.map((c) => c.id));

  const toggle = (id: string) => {
    if (attachedIds.has(id)) detachMut.mutate(id);
    else attachMut.mutate(id);
  };

  return (
    <div>
      <p className="mb-3 text-xs font-semibold text-neutral-500">LISTS</p>
      {all.length === 0 ? (
        <p className="text-sm text-neutral-500">No lists yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {all.map((c) => (
            <Chip
              key={c.id}
              label={`#${c.name}`}
              selected={attachedIds.has(c.id)}
              onClick={() => toggle(c.id)}
              disabled={attachMut.isPending || detachMut.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
