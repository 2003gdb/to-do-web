"use client";

import { Button } from "@/components/ds/Button";

type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="rounded-sm bg-danger-muted px-4 py-2 text-sm font-medium text-danger prose-measure">
        {message}
      </div>
      {onRetry ? <Button label="Try again" variant="ghost" size="md" onClick={onRetry} /> : null}
    </div>
  );
}
