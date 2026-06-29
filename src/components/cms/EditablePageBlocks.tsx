import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { CmsMark } from "@/components/CmsMark";
import { useCmsSection } from "@/lib/cms/useCmsContent";
import { track } from "@/lib/analytics";


export type EditableHeroContent = {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
};

const isExternal = (h?: string) => !!h && /^https?:\/\//i.test(h);

/**
 * Hero section editable in /admin/editor. Pass `sectionKey` matching a
 * SECTIONS entry. Children render inside the hero after the auto-rendered
 * CTA buttons (use for extra decorations). When the CMS hero defines
 * `ctaPrimaryLabel`, primary/secondary buttons are rendered automatically.
 */
export function EditableHero({
  sectionKey,
  label,
  bgImage,
  children,
}: {
  sectionKey: string;
  label: string;
  bgImage?: string;
  children?: ReactNode;
}) {
  const c = useCmsSection<EditableHeroContent>(sectionKey);
  return (
    <CmsMark kind="section" target={sectionKey} label={label} as="div">
      <PageHero
        eyebrow={c.eyebrow}
        title={
          <>
            {c.title}
            {c.titleAccent ? (
              <>
                {" "}
                <span className="text-gradient">{c.titleAccent}</span>
              </>
            ) : null}
          </>
        }
        description={c.description}
        bgImage={bgImage}
      >
        {c.ctaPrimaryLabel ? (
          <div className="flex flex-wrap gap-3">
            <a
              href={c.ctaPrimaryHref || "#"}
              target={isExternal(c.ctaPrimaryHref) ? "_blank" : undefined}
              rel="noopener noreferrer"
              onClick={() => track("hero_cta_click", { section: sectionKey, label: c.ctaPrimaryLabel ?? "", href: c.ctaPrimaryHref ?? "", role: "primary" })}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-110"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {c.ctaPrimaryLabel}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            {c.ctaSecondaryLabel ? (
              <a
                href={c.ctaSecondaryHref || "#"}
                target={isExternal(c.ctaSecondaryHref) ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => track("hero_cta_click", { section: sectionKey, label: c.ctaSecondaryLabel ?? "", href: c.ctaSecondaryHref ?? "", role: "secondary" })}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold transition hover:border-white/30 hover:bg-white/5"
              >
                <span className="relative z-10">{c.ctaSecondaryLabel}</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
            ) : null}

          </div>
        ) : null}
        {children}
      </PageHero>
    </CmsMark>
  );
}

export type EditableCtaContent = {
  title: string;
  body?: string;
  buttonLabel: string;
  buttonHref: string;
};

/**
 * Bottom CTA block editable in /admin/editor. Pass `sectionKey` matching a
 * SECTIONS entry and the background image asset.
 */
export function EditableCta({
  sectionKey,
  label,
  bgImage,
  align = "split",
}: {
  sectionKey: string;
  label: string;
  bgImage?: string;
  /** "split" = title left, button right. "center" = title centered, button under. */
  align?: "split" | "center";
}) {
  const c = useCmsSection<EditableCtaContent>(sectionKey);
  const external = isExternal(c.buttonHref);
  const buttonClass =
    "group relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80";
  const buttonInner = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">
        {c.buttonLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </>
  );

  return (
    <CmsMark kind="section" target={sectionKey} label={label} as="div">
      <Reveal as="section" className="container-x pb-24">
        <div
          className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-brand p-10 shadow-brand md:p-14 ${align === "center" ? "text-center" : ""}`}
        >
          {bgImage && (
            <img
              src={bgImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen transition-all duration-700 group-hover:scale-105 group-hover:opacity-50"
            />
          )}
          {align === "center" ? (
            <div className="relative">
              <h2 className="display text-balance text-3xl font-bold text-white md:text-4xl">{c.title}</h2>
              {c.body && <p className="mx-auto mt-3 max-w-xl text-white/85">{c.body}</p>}
              <div className="mt-6 flex justify-center">
                {external ? (
                  <a href={c.buttonHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                    {buttonInner}
                  </a>
                ) : (
                  <a href={c.buttonHref} className={buttonClass}>
                    {buttonInner}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="display text-balance text-3xl font-bold text-white md:text-4xl">{c.title}</h2>
                {c.body && <p className="mt-3 max-w-xl text-white/85">{c.body}</p>}
              </div>
              {external ? (
                <a href={c.buttonHref} target="_blank" rel="noopener noreferrer" className={`${buttonClass} md:justify-self-end`}>
                  {buttonInner}
                </a>
              ) : (
                <a href={c.buttonHref} className={`${buttonClass} md:justify-self-end`}>
                  {buttonInner}
                </a>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </CmsMark>
  );
}
