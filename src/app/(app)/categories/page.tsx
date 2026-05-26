"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { IconTile } from "@/components/ds/IconTile";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreateCategory, useDeleteCategory } from "@/hooks/mutations/useCategoryMutations";
import { errorMessage } from "@/utils/errorMessage";
import { cn } from "@/utils/cn";

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const createMut = useCreateCategory();
  const deleteMut = useDeleteCategory();
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setFormError(null);
    try {
      await createMut.mutateAsync({ name: trimmed });
      setName("");
    } catch (err) {
      setFormError(errorMessage(err, "Could not create category"));
    }
  };

  const handleDeleteClick = (id: string) => {
    if (confirmId === id) {
      deleteMut.mutate(id, { onSettled: () => setConfirmId(null) });
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="pb-12">
      <PageHeader title="Lists" />

      <div className="mb-4 px-4 md:mb-10 md:px-6">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="New list name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
          <Button
            label="Add"
            size="md"
            loading={createMut.isPending}
            loadingLabel="…"
            disabled={!name.trim()}
            onClick={handleCreate}
          />
        </div>
        {formError ? (
          <p className="mt-3 text-sm text-danger">{formError}</p>
        ) : null}
      </div>

      <div className="px-1 md:px-3">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="px-3"><ErrorState message={errorMessage(error, "Could not load lists")} onRetry={() => refetch()} /></div>
        ) : categories.length === 0 ? (
          <div className="px-3"><EmptyState title="No lists yet" description="Create your first list above." /></div>
        ) : (
          <ul className="border-t border-border-subtle">
            {categories.map((c) => {
              const isConfirming = confirmId === c.id;
              const isDeleting = deleteMut.isPending && deleteMut.variables === c.id;
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 border-b border-border-subtle px-3 py-4 md:px-4"
                >
                  <Link
                    href={`/categories/${c.id}`}
                    className="flex flex-1 items-center gap-3 min-w-0 rounded-sm outline-none focus-visible:shadow-[var(--shadow-focus)]"
                  >
                    <IconTile symbol="#" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-text-primary">{c.name}</p>
                      {c.description ? (
                        <p className="truncate text-xs text-text-muted">{c.description}</p>
                      ) : null}
                    </div>
                  </Link>
                  {isConfirming ? (
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-xs px-1 text-xs text-text-muted outline-none transition-colors hover:text-text-primary focus-visible:shadow-[var(--shadow-focus)]"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label={isConfirming ? "Confirm delete list" : "Delete list"}
                    onClick={() => handleDeleteClick(c.id)}
                    disabled={isDeleting}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
                      isConfirming
                        ? "bg-danger-muted text-danger hover:bg-danger-muted/80"
                        : "text-text-muted hover:bg-surface-sunken hover:text-danger",
                      isDeleting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Trash2 size={14} />
                    {isConfirming ? <span>Confirm</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
