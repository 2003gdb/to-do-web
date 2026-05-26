import { cn } from "@/utils/cn";

type Props = {
  symbol?: string;
  bg?: string;
  className?: string;
};

export function IconTile({ symbol = "•", bg = "bg-surface-sunken", className }: Props) {
  return (
    <div
      className={cn(
        "w-10 h-10 rounded-sm flex items-center justify-center text-base font-medium text-text-secondary",
        bg,
        className
      )}
    >
      {symbol}
    </div>
  );
}
