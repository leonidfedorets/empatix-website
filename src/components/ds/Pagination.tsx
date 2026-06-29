import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  className?: string;
  numberStyle?: "plain" | "padded"; // padded → "01"
};

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
  numberStyle = "plain",
}: Props) {
  if (totalPages <= 1) return null;
  const fmt = (n: number) =>
    numberStyle === "padded" ? String(n).padStart(2, "0") : String(n);

  const arrowCls =
    "inline-grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-brand-sky/40 hover:bg-white/5 hover:text-foreground disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-muted-foreground";

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={arrowCls}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
        const active = n === page;
        return (
          <button
            key={n}
            type="button"
            aria-current={active ? "page" : undefined}
            aria-label={`Page ${n}`}
            onClick={() => onChange(n)}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
              active
                ? "border-brand-sky/60 bg-brand-sky/10 text-foreground"
                : "border-white/10 text-muted-foreground hover:border-brand-sky/40 hover:bg-white/5 hover:text-foreground",
            )}
          >
            {fmt(n)}
          </button>
        );
      })}
      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className={arrowCls}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function PaginationMeta({
  page,
  pageSize,
  total,
  totalPages,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  className?: string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 text-xs uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      <p>
        Showing <span className="text-foreground">{from}–{to}</span> of {total}
      </p>
      <p>
        Page <span className="text-foreground">{String(page).padStart(2, "0")}</span> /{" "}
        {String(totalPages).padStart(2, "0")}
      </p>
    </div>
  );
}
