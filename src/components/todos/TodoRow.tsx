"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Priority, Todo } from "@/types/todo";

const priorityDot: Record<Priority, string> = {
  LOW: "bg-border",
  MEDIUM: "bg-text-muted",
  HIGH: "bg-warning",
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
  return (
    <Link
      href={`/todos/${todo.id}`}
      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-sunken outline-none focus-visible:bg-surface-sunken focus-visible:shadow-[var(--shadow-focus)]"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-sm",
          todo.completed
            ? "bg-accent text-surface-sunken"
            : "bg-gold-muted text-accent"
        )}
        aria-hidden
      >
        {todo.completed ? (
          <Check size={18} strokeWidth={2.5} />
        ) : todo.priority ? (
          <span
            className={cn("h-2 w-2 rounded-full", priorityDot[todo.priority])}
          />
        ) : (
          <span className="h-2 w-2 rounded-full bg-accent" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-base font-medium",
            todo.completed ? "text-text-muted line-through" : "text-text-primary"
          )}
        >
          {todo.title}
        </p>
        {todo.description ? (
          <p className="mt-0.5 truncate text-xs text-text-muted">{todo.description}</p>
        ) : null}
      </div>

      <span className="shrink-0 text-xs tabular-nums text-text-muted">
        {formatDate(todo.createdAt)}
      </span>
    </Link>
  );
}
