import { cn } from "@/utils/cn";

type Props = {
  symbol?: string;
  bg?: string;
  className?: string;
};

export function IconTile({ symbol = "•", bg = "bg-neutral-100", className }: Props) {
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-semibold text-neutral-900",
        bg,
        className
      )}
    >
      {symbol}
    </div>
  );
}
