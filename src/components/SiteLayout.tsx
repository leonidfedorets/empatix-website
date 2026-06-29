import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScrollToTop } from "./ScrollToTop";
import { CmsMark } from "./CmsMark";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CmsMark kind="section" target="footer" label="Footer" as="div">
        <SiteFooter />
      </CmsMark>
      <ScrollToTop />
    </div>
  );
}


export function PageHero({
  eyebrow,
  title,
  description,
  children,
  bgImage,
  bgOpacityClass = "opacity-30",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  bgImage?: string;
  bgOpacityClass?: string;
}) {
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="group relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-brand-soft" />
      {bgImage && (
        <>
          <motion.img
            src={bgImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={`pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover mix-blend-screen transition-[opacity,filter] duration-700 group-hover:brightness-125 group-hover:opacity-90 ${bgOpacityClass}`}
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <div
            aria-hidden
            className="electric-overlay pointer-events-none absolute inset-0 -z-10 opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
          />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/70 to-background/20" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </>
      )}
      <div className="container-x section-y">
        {eyebrow && (
          <motion.p className="eyebrow mb-5" {...fade(0)}>
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          className="display fluid-h1 text-balance text-readable-wide font-bold"
          {...fade(0.12)}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className="fluid-body text-readable mt-5 leading-relaxed text-muted-foreground md:mt-6"
            {...fade(0.24)}
          >
            {description}
          </motion.p>
        )}
        {children && (
          <motion.div className="mt-8 md:mt-10" {...fade(0.36)}>
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

