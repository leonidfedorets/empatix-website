import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 14,
  duration = 0.6,
  className,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "span" | "p" | "h1" | "h2" | "h3";
  once?: boolean;
}) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Comp>
  );
}

export function RevealGroup({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const Comp = motion[as] as typeof motion.div;
  const variants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
  return (
    <Comp
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
      className={className}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
  y = 14,
  duration = 0.6,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span" | "p";
  y?: number;
  duration?: number;
}) {
  const Comp = motion[as] as typeof motion.div;
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
  };
  return (
    <Comp variants={variants} className={className}>
      {children}
    </Comp>
  );
}
