import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/empatix-logo-white.png";
import markAsset from "@/assets/empatix_mark_filled.png";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <img
      src={markAsset}
      alt="Empatix — AI products and automation"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  const src = variant === "full" ? logoAsset : markAsset;
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
