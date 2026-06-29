import { cn } from "@/lib/utils";

export function FilterPill({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center rounded-full border px-5 py-2 text-sm font-semibold transition",
        active
          ? "border-brand-sky/60 bg-brand-sky/10 text-foreground"
          : "border-white/10 text-muted-foreground hover:border-brand-sky/40 hover:bg-white/5 hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}
