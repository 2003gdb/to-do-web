"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Pill } from "@/components/ds/Pill";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { TodoRow } from "@/components/todos/TodoRow";
import { useTodos } from "@/hooks/queries/useTodos";
import { useUiStore } from "@/store/useUiStore";
import { errorMessage } from "@/utils/errorMessage";

export default function HomePage() {
  const { data: todos = [], isLoading, error, refetch } = useTodos();
  const filter = useUiStore((s) => s.filter);
  const setFilter = useUiStore((s) => s.setFilter);

  const { pending, done, total, list } = useMemo(() => {
    const d = todos.filter((t) => t.completed).length;
    const filtered =
      filter === "pending"
        ? todos.filter((t) => !t.completed)
        : filter === "completed"
          ? todos.filter((t) => t.completed)
          : todos;
    return { pending: todos.length - d, done: d, total: todos.length, list: filtered };
  }, [todos, filter]);

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex justify-center pt-4">
        <Pill label="Today" dot />
      </div>

      <div className="flex flex-col items-center">
        <p className="text-sm text-neutral-500">
          {percent}% complete · {done}/{total}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-6xl font-bold text-neutral-900">{pending}</span>
          <span className="text-2xl font-semibold text-neutral-400">pending</span>
        </div>
      </div>

      <div className="flex gap-3 px-5">
        <Link href="/todos/new" className="flex-1">
          <Button label="Add" fullWidth iconRight icon={<Plus size={18} />} />
        </Link>
        <Button
          label={filter === "all" ? "All" : filter === "pending" ? "Pending" : "Done"}
          variant="secondary"
          iconRight
          icon={<SlidersHorizontal size={16} />}
          onClick={() =>
            setFilter(filter === "all" ? "pending" : filter === "pending" ? "completed" : "all")
          }
        />
      </div>

      <div className="px-5">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={errorMessage(error, "Could not load todos")} onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            title="No todos here"
            description="Tap Add to create your first task."
          />
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white">
            {list.map((t, i) => (
              <div key={t.id}>
                {i > 0 ? <div className="mx-4 h-px bg-neutral-100" /> : null}
                <TodoRow todo={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
