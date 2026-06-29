import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Variant = "ghost" | "brand";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const variantClasses: Record<Variant, string> = {
  ghost:
    "border border-white/10 text-muted-foreground hover:border-brand-sky/40 hover:bg-white/5 hover:text-foreground",
  brand:
    "border border-white/15 bg-gradient-brand text-white shadow-brand hover:brightness-110",
};

const baseCls =
  "inline-grid place-items-center rounded-full transition disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-muted-foreground";

function makeCls(size: Size, variant: Variant, className?: string) {
  return cn(baseCls, sizeClasses[size], variantClasses[variant], className);
}

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: "a";
  size?: Size;
  variant?: Variant;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: "button";
  size?: Size;
  variant?: Variant;
};

export function IconButton(props: AnchorProps | ButtonProps) {
  if (props.as === "a") {
    const { as: _as, size = "md", variant = "ghost", className, children, ...rest } = props;
    return (
      <a className={makeCls(size, variant, className)} {...rest}>
        {children}
      </a>
    );
  }
  const { as: _as, size = "md", variant = "ghost", className, children, ...rest } = props;
  return (
    <button className={makeCls(size, variant, className)} {...rest}>
      {children}
    </button>
  );
}
