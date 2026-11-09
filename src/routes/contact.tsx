import { createFileRoute, useRouter } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { Mail, Phone, MapPin, Linkedin, Send, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { EditableHero } from "@/components/cms/EditablePageBlocks";
import { CmsMark } from "@/components/CmsMark";
import { useCmsSection } from "@/lib/cms/useCmsContent";
import bgContact from "@/assets/bg-contact.jpg";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";


function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.123-.272-.198-.57-.347zM12.04 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.992c-.003 5.45-4.437 9.886-9.887 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.49-8.413z"/>
    </svg>
  );
}

export const Route = createFileRoute("/contact")({
  head: () => {
    const base = seoMeta({
      title: 'Contact Empatix',
      description: 'Tell us about your product, automation or fractional CTO need. We reply within one business day',
      path: '/contact',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }],
    });
    return {
      ...base,
      scripts: [
        ...(base.scripts ?? []),
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Empatix",
            url: "https://empathic-site-studio.lovable.app/contact",
            email: "sales@empatixtech.com",
            telephone: "+371 24965 140",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Pērnavas iela 21–22",
              addressLocality: "Rīga",
              postalCode: "LV-1009",
              addressCountry: "LV",
            },
            sameAs: ["https://www.linkedin.com/company/empatixdev/"],
          }),
        },
      ],
    };
  },
  component: ContactPage,
});

const MAX_MESSAGE = 1000;
const MIN_FILL_MS = 3000;          // bots usually submit instantly
const RL_KEY = "contact_rl_v1";
const RL_WINDOW_MS = 10 * 60_000;  // 10 minutes
const RL_MAX = 3;                  // max 3 submissions per window
const COOLDOWN_MS = 15_000;        // between submits

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkRate(): { ok: boolean; retryInSec?: number } {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(RL_KEY);
    const arr: number[] = raw ? JSON.parse(raw) : [];
    const recent = arr.filter((t) => now - t < RL_WINDOW_MS);
    if (recent.length >= RL_MAX) {
      const retry = Math.ceil((RL_WINDOW_MS - (now - recent[0])) / 1000);
      return { ok: false, retryInSec: retry };
    }
    if (recent.length && now - recent[recent.length - 1] < COOLDOWN_MS) {
      const retry = Math.ceil((COOLDOWN_MS - (now - recent[recent.length - 1])) / 1000);
      return { ok: false, retryInSec: retry };
    }
    recent.push(now);
    localStorage.setItem(RL_KEY, JSON.stringify(recent));
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

type ContactForm = {
  heading: string;
  subheading: string;
  interestsLabel: string;
  interests: string;
  contextLabel: string;
  contextPlaceholder: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
};

type ContactDetails = {
  email: string; emailNote: string;
  phone: string; phoneHref: string; phoneNote: string;
  address: string; addressNote: string;
  linkedinUrl: string; linkedinNote: string;
  telegramUrl: string; telegramNote: string;
  whatsappUrl: string; whatsappNote: string;
};

function ContactPage() {
  const router = useRouter();
  const form = useCmsSection<ContactForm>("contact_form");
  const details = useCmsSection<ContactDetails>("contact_details");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mountedAt] = useState(() => Date.now());

  const interestOptions = useMemo(
    () => (form.interests || "").split("\n").map((s) => s.trim()).filter(Boolean),
    [form.interests],
  );

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => {
      if (window.history.length > 1) router.history.back();
    }, 2200);
    return () => clearTimeout(t);
  }, [sent, router]);

  const toggleInterest = (t: string) => {
    setInterests((prev) => {
      if (t === "Other") {
        return prev.includes("Other") ? [] : ["Other"];
      }
      const without = prev.filter((x) => x !== "Other");
      return without.includes(t) ? without.filter((x) => x !== t) : [...without, t];
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    if ((fd.get("website") as string)?.trim()) { setSent(true); return; }
    if (Date.now() - mountedAt < MIN_FILL_MS) {
      setError("Please take a moment to fill the form.");
      return;
    }
    const name = (fd.get("name") as string || "").trim();
    const email = (fd.get("email") as string || "").trim();
    if (name.length < 2 || name.length > 100) { setError("Please enter a valid name."); return; }
    if (!emailRe.test(email) || email.length > 255) { setError("Please enter a valid work email."); return; }
    if (message.length > MAX_MESSAGE) { setError("Message is too long."); return; }
    const rl = checkRate();
    if (!rl.ok) {
      setError(`Too many submissions. Try again in ${rl.retryInSec}s.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: (fd.get("company") as string) || "",
          role: (fd.get("role") as string) || "",
          message,
          interests,
          website: (fd.get("website") as string) || "",
          elapsedMs: Date.now() - mountedAt,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 429) {
          const retry = body?.retryAfter ? ` Try again in ${body.retryAfter}s.` : "";
          setError(`Too many requests.${retry}`);
        } else {
          setError(body?.error || "Something went wrong. Please try again.");
        }
        return;
      }
      track("contact_submit", { interests: interests.join(",") || "none", message_len: message.length });
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <EditableHero sectionKey="contact_hero" label="Contact — Hero" bgImage={bgContact} />

      <CmsMark kind="section" target="contact_form" label="Contact — Form" as="section" className="container-x grid gap-10 pb-24 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-card p-8 md:p-10"
        >
          <h2 className="display text-2xl font-bold">{form.heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{form.subheading}</p>

          {/* Honeypot — visually hidden, off-screen, ignored by users */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="name" placeholder="Jane Doe" required />
            <Field label="Work email" name="email" type="email" placeholder="jane@company.com" required />
            <Field label="Company"    name="company" placeholder="Acme Inc." />
            <Field label="Your role"  name="role" placeholder="Founder / CTO / Ops Lead" />
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{form.interestsLabel}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {interestOptions.map((t) => {
                const active = interests.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleInterest(t)}
                    aria-pressed={active}
                    className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-brand-sky bg-brand/15 text-white"
                        : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{form.contextLabel}</label>
            <div className="relative mt-2">
              <textarea
                name="message" rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                maxLength={MAX_MESSAGE}
                placeholder={form.contextPlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 pb-8 text-sm placeholder:text-muted-foreground focus:border-brand-sky focus:outline-none"
              />
              <span className={`pointer-events-none absolute bottom-2 right-3 text-[11px] tabular-nums ${message.length >= MAX_MESSAGE ? "text-brand-sky" : "text-muted-foreground"}`}>
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={sent || submitting}
            className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:scale-[1.03] hover:shadow-[0_12px_40px_-8px_hsl(var(--brand-sky)/0.6)] disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{form.submitLabel}</span>
            <Send className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <AnimatePresence>
            {sent && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-card/95 backdrop-blur"
              >
                <div className="flex flex-col items-center text-center px-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="grid h-20 w-20 place-items-center rounded-full bg-brand/15 text-brand-sky shadow-[0_0_0_8px_hsl(var(--brand-sky)/0.08)]"
                  >
                    <CheckCircle2 className="h-12 w-12" strokeWidth={2.2} />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="display mt-5 text-2xl font-bold"
                  >
                    {form.successTitle}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-2 max-w-sm text-sm text-muted-foreground"
                  >
                    {form.successBody}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <CmsMark kind="section" target="contact_details" label="Contact — Details" as="aside" className="space-y-4">
          <ContactCard i={Mail} t={details.email} d={details.emailNote} href={`mailto:${details.email}`} />
          <ContactCard i={Phone} t={details.phone} d={details.phoneNote} href={details.phoneHref} />
          <ContactCard i={MapPin} t={details.address} d={details.addressNote} />
          <ContactCard i={Linkedin} t="LinkedIn" d={details.linkedinNote} href={details.linkedinUrl} external />
          <ContactCard i={Send} t="Telegram" d={details.telegramNote} href={details.telegramUrl} external />
          <ContactCard i={WhatsAppIcon} t="WhatsApp" d={details.whatsappNote} href={details.whatsappUrl} external />
        </CmsMark>
      </CmsMark>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", placeholder, required }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-brand-sky" aria-hidden="true">*</span>}
      </span>
      <input
        name={name} type={type} placeholder={placeholder} required={required}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-brand-sky focus:outline-none"
      />
    </label>
  );
}

function ContactCard({
  i: Icon,
  t,
  d,
  href,
  external,
}: {
  i: ComponentType<{ className?: string }>;
  t: string;
  d: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand-sky">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-semibold">{t}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{d}</p>
      </div>
    </>
  );
  const cls = "flex gap-4 rounded-2xl border border-white/5 bg-card p-5 transition hover:border-brand-sky/40";
  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {inner}
      </a>
    );
  }
  return <div className={cls}>{inner}</div>;
}
