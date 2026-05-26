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

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await addMut.mutateAsync(trimmed);
      setText("");
    } catch (err) {
      alert(errorMessage(err, "Could not add comment"));
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-neutral-500">COMMENTS</p>

      <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2">
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
        <ErrorState message={errorMessage(error, "Could not load comments")} onRetry={() => refetch()} />
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-500">No comments yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl bg-neutral-50 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-900">{c.content}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {c.authorEmail} · {formatDateTime(c.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMut.mutate(c.id)}
                  className="rounded-full p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700"
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
