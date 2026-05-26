"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search as SearchIcon } from "lucide-react";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TodoRow } from "@/components/todos/TodoRow";
import { useTodos } from "@/hooks/queries/useTodos";
import { useUiStore } from "@/store/useUiStore";
import { errorMessage } from "@/utils/errorMessage";
import { cn } from "@/utils/cn";

type Filter = "all" | "pending" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Done" },
];

export default function HomePage() {
  const { data: todos = [], isLoading, error, refetch } = useTodos();
  const filter = useUiStore((s) => s.filter);
  const setFilter = useUiStore((s) => s.setFilter);
  const [query, setQuery] = useState("");

  const { pending, total, list } = useMemo(() => {
    const d = todos.filter((t) => t.completed).length;
    const byFilter =
      filter === "pending"
        ? todos.filter((t) => !t.completed)
        : filter === "completed"
          ? todos.filter((t) => t.completed)
          : todos;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? byFilter.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description ?? "").toLowerCase().includes(q)
        )
      : byFilter;
    return { pending: todos.length - d, total: todos.length, list: filtered };
  }, [todos, filter, query]);

  return (
    <div className="relative pb-28 pt-10 md:pt-14">
      <header className="mb-8 flex items-end justify-between px-4 md:mb-10 md:px-6">
        <h1 className="-ml-[0.02em] text-xl font-semibold tracking-tight text-text-primary">
          Today
        </h1>
        <span className="inline-flex items-center rounded-xs border border-border-subtle bg-surface-elevated px-2.5 py-1 text-xs tabular-nums text-text-secondary">
          {pending} of {total}
        </span>
      </header>

      <label
        htmlFor="home-search"
        className="mb-5 mx-4 flex items-center gap-2 rounded-sm border border-border-subtle bg-surface px-3 py-2 transition-colors focus-within:border-border-strong focus-within:shadow-[var(--shadow-focus)] md:mx-6"
      >
        <SearchIcon size={16} className="text-text-muted" aria-hidden />
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks"
          className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </label>

      <div
        role="tablist"
        aria-label="Filter todos"
        className="mb-5 inline-flex w-fit gap-1 rounded-sm bg-surface-sunken p-1 ml-4 md:ml-6"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={cn(
                "min-h-11 rounded-xs px-4 py-2 text-sm transition-colors outline-none focus-visible:shadow-[var(--shadow-focus)]",
                active
                  ? "bg-accent text-accent-contrast font-medium"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <section className="px-1 md:px-3">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="px-3 md:px-3">
            <ErrorState
              message={errorMessage(error, "Could not load todos")}
              onRetry={() => refetch()}
            />
          </div>
        ) : list.length === 0 ? (
          <div className="px-3 md:px-3">
            <EmptyState
              title={query ? "No matches" : "Nothing here"}
              description={
                query
                  ? `Nothing matches "${query}".`
                  : "Capture the next thing with the + button."
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border-subtle border-y border-border-subtle">
            {list.map((t) => (
              <li key={t.id}>
                <TodoRow todo={t} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/todos/new"
        aria-label="New todo"
        className="fixed bottom-24 right-6 z-10 flex h-16 w-16 items-center justify-center rounded-md bg-accent text-accent-contrast shadow-[var(--shadow-pop)] transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] md:bottom-8 md:right-10 md:h-20 md:w-20"
      >
        <Plus size={28} strokeWidth={2.25} className="md:hidden" />
        <Plus size={32} strokeWidth={2.25} className="hidden md:block" />
      </Link>
    </div>
  );
}
