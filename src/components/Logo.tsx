import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/empatix-mark.svg"
      alt="Empatix"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  const src = variant === "full" ? "/empatix-logo-white.svg" : "/empatix-mark.svg";
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="Empatix home"
    >
      <img
        src={src}
        alt="Empatix — AI products and automation"
        className={variant === "full" ? "h-9 w-auto" : "h-9 w-9"}
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
