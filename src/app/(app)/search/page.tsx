"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TodoRow } from "@/components/todos/TodoRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { useTodos } from "@/hooks/queries/useTodos";
import { errorMessage } from "@/utils/errorMessage";

export default function SearchPage() {
  const { data: todos = [], isLoading, error, refetch } = useTodos();
  const [query, setQuery] = useState("");

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
    );
  }, [query, todos]);

  const trimmed = query.trim();

  return (
    <div className="pb-12">
      <PageHeader title="Search" />

      <label
        htmlFor="search-input"
        className="mb-6 mx-4 flex items-center gap-2 rounded-sm border border-border-subtle bg-surface px-3 py-2 transition-colors focus-within:border-border-strong focus-within:shadow-[var(--shadow-focus)] md:mx-6"
      >
        <SearchIcon size={16} className="text-text-muted" aria-hidden />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          autoFocus
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </label>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="px-4 md:px-6">
          <ErrorState message={errorMessage(error, "Could not search")} onRetry={() => refetch()} />
        </div>
      ) : trimmed.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState title="Type to search" description="Search tasks by title or description." />
        </div>
      ) : matched.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState title="No matches" description={`Nothing matches "${trimmed}".`} />
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle border-y border-border-subtle">
          {matched.map((t) => (
            <li key={t.id}>
              <TodoRow todo={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
