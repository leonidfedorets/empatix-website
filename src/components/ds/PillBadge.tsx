import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "muted" | "outline" | "brand";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  muted:
    "border border-white/10 bg-white/5 text-muted-foreground",
  outline:
    "border border-white/10 bg-white/5 text-foreground",
  brand:
    "border border-brand-sky/40 bg-brand-sky/10 text-foreground",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2.5 py-1 text-[10px] tracking-widest",
  md: "px-3 py-1 text-[11px] tracking-wider",
};

export function PillBadge({
  variant = "outline",
  size = "sm",
  className,
  children,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold uppercase",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
