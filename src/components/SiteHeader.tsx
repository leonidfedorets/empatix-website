import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/services", label: "Services" },
  { to: "/ai-solutions", label: "AI Solutions" },
  { to: "/cases", label: "Products & Cases" },
  { to: "/industries", label: "Industries" },
  { to: "/how-we-work", label: "How We Work" },
  { to: "/about", label: "About" },
  { to: "/insights", label: "Insights" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-background/85 backdrop-blur-xl shadow-[0_4px_24px_-12px_rgba(0,0,0,0.4)]"
            : "border-white/5 bg-background/70 backdrop-blur-xl"
        }`}
      >
        <div className={`container-x flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
          <div className="transition-transform duration-200 hover:scale-[1.04]">
            <Logo />
          </div>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
                activeProps={{ className: "active" }}
              >
                <span className="relative">
                  {item.label}
                  <span className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-brand-sky transition-transform duration-300 group-hover:scale-x-100 group-[.active]:scale-x-100" />
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="https://quotes.empatixtech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative hidden overflow-hidden rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-110 sm:inline-flex"
            >
              <span className="relative z-10">Get your quick offer</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-grid h-11 w-11 place-items-center rounded-full border border-white/10 transition hover:bg-white/5 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/5 bg-background lg:hidden"
            >
              <div className="container-x flex flex-col py-3">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-3.5 text-base text-foreground/90 hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <a
                  href="https://quotes.empatixtech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full bg-gradient-brand px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Get your quick offer
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
