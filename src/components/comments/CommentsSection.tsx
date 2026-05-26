"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { useComments } from "@/hooks/queries/useComments";
import { useAddComment, useDeleteComment } from "@/hooks/mutations/useCommentMutations";
import { formatDateTime } from "@/utils/formatDate";
import { errorMessage } from "@/utils/errorMessage";

export function CommentsSection({ todoId }: { todoId: string }) {
  const { data: comments = [], isLoading, error, refetch } = useComments(todoId);
  const addMut = useAddComment(todoId);
  const deleteMut = useDeleteComment(todoId);
  const [text, setText] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setAddError(null);
    try {
      await addMut.mutateAsync(trimmed);
      setText("");
    } catch (err) {
      setAddError(errorMessage(err, "Could not add comment"));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-text-secondary">Comments</h2>

      {addError ? (
        <div
          role="alert"
          className="rounded-sm border border-danger bg-danger-muted px-3 py-2 text-sm text-danger"
        >
          {addError}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Input
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button
          label="Post"
          size="md"
          loading={addMut.isPending}
          loadingLabel="…"
          disabled={!text.trim()}
          onClick={handleAdd}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState
          message={errorMessage(error, "Could not load comments")}
          onRetry={() => refetch()}
        />
      ) : comments.length === 0 ? (
        <p className="text-sm text-text-muted">No comments yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-subtle">
          {comments.map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-text-primary prose-measure">{c.content}</p>
                  <p className="mt-1 text-xs tabular-nums text-text-muted">
                    {c.authorEmail} · {formatDateTime(c.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMut.mutate(c.id)}
                  className="rounded-sm p-2 text-text-muted outline-none transition-colors hover:bg-surface-sunken hover:text-text-primary focus-visible:shadow-[var(--shadow-focus)]"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
