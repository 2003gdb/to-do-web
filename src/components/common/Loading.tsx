import { cn } from "@/utils/cn";

type Props = { label?: string; className?: string };

export function Loading({ label = "Loading…", className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10", className)}>
      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-accent" />
      <span className="text-sm text-text-muted">{label}</span>
    </div>
  );
}
