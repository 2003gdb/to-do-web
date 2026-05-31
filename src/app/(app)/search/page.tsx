"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TodoRow } from "@/components/todos/TodoRow";
import { IconTile } from "@/components/ds/IconTile";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTodos } from "@/hooks/queries/useTodos";
import { useCategories } from "@/hooks/queries/useCategories";
import { errorMessage } from "@/utils/errorMessage";
import { cn } from "@/utils/cn";

type Scope = "all" | "tasks" | "lists";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tasks", label: "Tasks" },
  { value: "lists", label: "Lists" },
];

export default function SearchPage() {
  const todosQuery = useTodos();
  const categoriesQuery = useCategories();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");

  const isLoading = todosQuery.isLoading || categoriesQuery.isLoading;
  const error = todosQuery.error ?? categoriesQuery.error;

  const { matchedTodos, matchedLists } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { matchedTodos: [], matchedLists: [] };
    const todos = (todosQuery.data ?? []).filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
    );
    const lists = (categoriesQuery.data ?? []).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    );
    return { matchedTodos: todos, matchedLists: lists };
  }, [query, todosQuery.data, categoriesQuery.data]);

  const showTasks = scope !== "lists";
  const showLists = scope !== "tasks";
  const trimmedQuery = query.trim();
  const noResults =
    trimmedQuery.length > 0 &&
    (!showTasks || matchedTodos.length === 0) &&
    (!showLists || matchedLists.length === 0);

  const retry = () => {
    if (todosQuery.error) todosQuery.refetch();
    if (categoriesQuery.error) categoriesQuery.refetch();
  };

  return (
    <div className="pb-12">
      <PageHeader title="Search" />

      <label
        htmlFor="search-input"
        className="mb-5 mx-4 flex items-center gap-2 rounded-sm border border-border-subtle bg-surface px-3 py-2 transition-colors focus-within:border-border-strong focus-within:shadow-[var(--shadow-focus)] md:mx-6"
      >
        <SearchIcon size={16} className="text-text-muted" aria-hidden />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks and lists"
          autoFocus
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </label>

      <div
        role="tablist"
        aria-label="Search scope"
        className="mb-6 inline-flex w-fit gap-1 rounded-sm bg-surface-sunken p-1 ml-4 md:ml-6"
      >
        {SCOPES.map((s) => {
          const active = scope === s.value;
          return (
            <button
              key={s.value}
              role="tab"
              aria-selected={active}
              onClick={() => setScope(s.value)}
              className={cn(
                "min-h-11 rounded-xs px-4 py-2 text-sm transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
                active
                  ? "bg-accent text-accent-contrast font-medium"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="px-4 md:px-6">
          <ErrorState message={errorMessage(error, "Could not search")} onRetry={retry} />
        </div>
      ) : trimmedQuery.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState title="Type to search" description="Search by list or task name." />
        </div>
      ) : noResults ? (
        <div className="px-4 md:px-6">
          <EmptyState title="No matches" description={`Nothing matches "${trimmedQuery}".`} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {showLists && matchedLists.length > 0 ? (
            <section aria-label="Matched lists">
              <h2 className="px-4 mb-2 text-xs font-medium uppercase tracking-wide text-text-muted md:px-6">
                Lists ({matchedLists.length})
              </h2>
              <ul className="border-t border-border-subtle">
                {matchedLists.map((c) => (
                  <li
                    key={c.id}
                    className="border-b border-border-subtle"
                  >
                    <Link
                      href={`/categories/${c.id}`}
                      className="flex items-center gap-3 px-4 py-4 outline-none focus-visible:bg-surface-sunken focus-visible:shadow-[var(--shadow-focus)] md:px-6"
                    >
                      <IconTile symbol="#" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">{c.name}</p>
                        {c.description ? (
                          <p className="truncate text-xs text-text-muted">{c.description}</p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {showTasks && matchedTodos.length > 0 ? (
            <section aria-label="Matched tasks">
              <h2 className="px-4 mb-2 text-xs font-medium uppercase tracking-wide text-text-muted md:px-6">
                Tasks ({matchedTodos.length})
              </h2>
              <ul className="divide-y divide-border-subtle border-y border-border-subtle">
                {matchedTodos.map((t) => (
                  <li key={t.id}>
                    <TodoRow todo={t} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
