"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { IconTile } from "@/components/ds/IconTile";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCategories } from "@/hooks/queries/useCategories";
import { useCreateCategory, useDeleteCategory } from "@/hooks/mutations/useCategoryMutations";
import { errorMessage } from "@/utils/errorMessage";

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const createMut = useCreateCategory();
  const deleteMut = useDeleteCategory();
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader title="Lists" />

      <div className="px-5">
        <Card padded={false} className="flex items-center gap-2 p-3">
          <Input
            className="flex-1 px-3"
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
        </Card>
        {formError ? (
          <p className="mt-2 text-sm text-red-700">{formError}</p>
        ) : null}
      </div>

      <div className="px-5">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={errorMessage(error, "Could not load lists")} onRetry={() => refetch()} />
        ) : categories.length === 0 ? (
          <EmptyState title="No lists yet" description="Create your first list above." />
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white">
            {categories.map((c, i) => (
              <div key={c.id}>
                {i > 0 ? <div className="mx-4 h-px bg-neutral-100" /> : null}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Link
                    href={`/categories/${c.id}`}
                    className="flex flex-1 items-center gap-3"
                  >
                    <IconTile symbol="#" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                      {c.description ? (
                        <p className="truncate text-xs text-neutral-500">{c.description}</p>
                      ) : null}
                    </div>
                  </Link>
                  <Button
                    label="Delete"
                    variant="danger"
                    size="md"
                    icon={<Trash2 size={14} />}
                    onClick={() => deleteMut.mutate(c.id)}
                    loading={deleteMut.isPending && deleteMut.variables === c.id}
                    loadingLabel="…"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
