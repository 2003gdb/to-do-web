"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { IconTile } from "@/components/ds/IconTile";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { TodoRow } from "@/components/todos/TodoRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTodos } from "@/hooks/queries/useTodos";
import { useCategories } from "@/hooks/queries/useCategories";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const todosQ = useTodos();
  const categoriesQ = useCategories();

  const term = q.trim().toLowerCase();

  const { matchedTodos, matchedCategories } = useMemo(() => {
    if (!term) return { matchedTodos: [], matchedCategories: [] };
    const todos = (todosQ.data ?? []).filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description ?? "").toLowerCase().includes(term)
    );
    const cats = (categoriesQ.data ?? []).filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.description ?? "").toLowerCase().includes(term)
    );
    return { matchedTodos: todos, matchedCategories: cats };
  }, [term, todosQ.data, categoriesQ.data]);

  const isLoading = todosQ.isLoading || categoriesQ.isLoading;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <PageHeader title="Search" />

      <div className="px-5">
        <Card padded={false} className="flex items-center gap-2 px-4 py-3">
          <SearchIcon size={18} className="text-neutral-400" />
          <Input
            placeholder="Search lists and tasks…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
        </Card>
      </div>

      {isLoading ? (
        <Loading />
      ) : !term ? (
        <div className="px-5">
          <EmptyState title="Type to search" description="Looks across lists and tasks." />
        </div>
      ) : matchedTodos.length === 0 && matchedCategories.length === 0 ? (
        <div className="px-5">
          <EmptyState title="No matches" description={`Nothing matches "${q}"`} />
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-5">
          {matchedCategories.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Lists
              </h2>
              <div className="overflow-hidden rounded-3xl bg-white">
                {matchedCategories.map((c, i) => (
                  <div key={c.id}>
                    {i > 0 ? <div className="mx-4 h-px bg-neutral-100" /> : null}
                    <Link
                      href={`/categories/${c.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
                    >
                      <IconTile symbol="#" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-neutral-900">{c.name}</p>
                        {c.description ? (
                          <p className="truncate text-xs text-neutral-500">{c.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {matchedTodos.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Tasks
              </h2>
              <div className="overflow-hidden rounded-3xl bg-white">
                {matchedTodos.map((t, i) => (
                  <div key={t.id}>
                    {i > 0 ? <div className="mx-4 h-px bg-neutral-100" /> : null}
                    <TodoRow todo={t} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
