"use client";

import Link from "next/link";
import { IconTile } from "@/components/ds/IconTile";
import type { Priority, Todo } from "@/types/todo";

const priorityTone: Record<Priority, { bg: string; label: string }> = {
  LOW: { bg: "bg-neutral-100", label: "L" },
  MEDIUM: { bg: "bg-amber-100", label: "M" },
  HIGH: { bg: "bg-red-100", label: "H" },
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return `Today · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TodoRow({ todo }: { todo: Todo }) {
  const tone = todo.priority ? priorityTone[todo.priority] : null;
  return (
    <Link
      href={`/todos/${todo.id}`}
      className="flex items-center gap-3 bg-white px-4 py-4 transition-colors hover:bg-neutral-50"
    >
      <IconTile
        symbol={todo.completed ? "✓" : tone?.label ?? "•"}
        bg={todo.completed ? "bg-green-100" : tone?.bg ?? "bg-neutral-100"}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-base font-semibold ${
            todo.completed ? "text-neutral-400 line-through" : "text-neutral-900"
          }`}
        >
          {todo.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-500">
          {todo.description || formatDate(todo.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-neutral-900">
          {todo.completed ? "Done" : "Pending"}
        </span>
        <span className="mt-0.5 text-xs text-neutral-500">{formatDate(todo.createdAt)}</span>
      </div>
    </Link>
  );
}
