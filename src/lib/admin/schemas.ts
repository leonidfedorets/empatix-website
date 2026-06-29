// Schema definitions for admin-editable content.
// Drives the generic SectionEditor / CollectionItemEditor forms.
// To add a new field, add it here — no other code changes needed.

export type FieldType = "text" | "textarea" | "richtext" | "image" | "url" | "number" | "boolean" | "icon" | "stats";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  /** When true, the editor offers existing values from sibling items as suggestions (datalist). */
  suggestionsFromSiblings?: boolean;
};

export type SectionDef = {
  key: string;
  label: string;
  description: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

export type CollectionDef = {
  key: string;
  label: string;
  description: string;
  titleField: string; // which field to show in the list view
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  /** Optional singleton section edited together with the collection (header above the list). */
  headerSection?: string;
  /** Optional field key whose value is an image URL, used to show thumbnails in the list view. */
  imageField?: string;
};

// ---- Singleton sections ----
export const SECTIONS: SectionDef[] = [
  {
    key: "hero",
    label: "Hero",
    description: "Main headline shown on the homepage.",
    fields: [
      { key: "headline", label: "Headline", type: "textarea" },
      { key: "subheadline", label: "Subheadline", type: "textarea" },
      { key: "ctaPrimaryLabel", label: "Primary CTA label", type: "text" },
      { key: "ctaPrimaryHref", label: "Primary CTA link", type: "url" },
      { key: "ctaSecondaryLabel", label: "Secondary CTA label", type: "text" },
      { key: "ctaSecondaryHref", label: "Secondary CTA link", type: "url" },
      { key: "ctaTertiaryLabel", label: "Tertiary link label", type: "text" },
      { key: "ctaTertiaryHref", label: "Tertiary link URL", type: "url" },
      { key: "proofMetric", label: "Proof — metric", type: "text", help: "Big number for the mini-case proof shown above the fold, e.g. '−63% manual ops time'." },
      { key: "proofText", label: "Proof — short context", type: "text", help: "One short sentence, e.g. 'after we shipped their internal ops tool in 9 weeks'." },
      { key: "proofCaseLabel", label: "Proof — link label", type: "text", help: "e.g. 'See the case'." },
      { key: "proofCaseHref", label: "Proof — link URL", type: "url", help: "Link to the case or proof page." },
    ],
    defaults: {
      headline: "Ship the AI products, automations and internal tools that quietly run your business",
      subheadline:
        "We pair senior engineers with a CTO in the room to design, ship and run software that cuts manual ops, replaces brittle spreadsheets and turns AI ideas into things your team actually uses — in weeks, not quarters.",
      ctaPrimaryLabel: "Get a quick estimate",
      ctaPrimaryHref: "https://quotes.empatixtech.com/",
      ctaSecondaryLabel: "Talk to us",
      ctaSecondaryHref: "/contact",
      ctaTertiaryLabel: "See recent work",
      ctaTertiaryHref: "/cases",
      proofMetric: "−60% manual ops time",
      proofText: "after we shipped an internal ops tool in 9 weeks",
      proofCaseLabel: "See the case",
      proofCaseHref: "/cases",
    },

  },
  {
    key: "about",
    label: "About",
    description: "About Us section content.",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body (rich text)", type: "richtext" },
      { key: "image", label: "Image", type: "image" },
    ],
    defaults: {
      title: "About Empatix",
      body: "<p>We are a senior engineering team with a CTO in the room.</p>",
      image: "",
    },
  },
  {
    key: "contact",
    label: "Contact",
    description: "Contact information shown across the site.",
    fields: [
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "calendarUrl", label: "Calendar booking URL", type: "url" },
    ],
    defaults: {
      email: "hello@empatixtech.com",
      phone: "",
      address: "",
      calendarUrl: "",
    },
  },
  {
    key: "trust_strip",
    label: "Trust strip (under hero)",
    description: "Eyebrow text shown above the metrics + client logos strip on the homepage.",
    fields: [
      { key: "eyebrow", label: "Eyebrow text", type: "text", help: "Small label shown above metrics, e.g. 'Trusted by teams shipping faster'." },
      { key: "showLogos", label: "Show client logos row", type: "boolean", help: "Turn off to hide the entire client logos strip until you have real logos to show." },
      { key: "logosCaption", label: "Logos caption", type: "text", help: "Tiny label above the logos row, e.g. 'Selected clients & partners'." },
    ],
    defaults: {
      eyebrow: "Trusted by teams shipping faster",
      showLogos: true,
      logosCaption: "Selected clients & partners",
    },

  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer description, contact and social links. Services and Company columns are built automatically from the Services collection and the Navigation.",
    fields: [
      { key: "description", label: "Description (left column under logo)", type: "textarea" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone (display)", type: "text" },
      { key: "phoneHref", label: "Phone link (tel:…)", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
      { key: "telegramUrl", label: "Telegram URL", type: "url" },
      { key: "whatsappUrl", label: "WhatsApp URL", type: "url" },
      { key: "copyright", label: "Copyright line", type: "text" },
    ],
    defaults: {
      description:
        "We help businesses build AI-powered products and automate operations using real business data, modern engineering, and CTO-level product guidance",
      email: "sales@empatixtech.com",
      phone: "+371 24965 140",
      phoneHref: "tel:+37124965140",
      address: "Pērnavas iela 21–22, Rīga, LV-1009, Latvia",
      linkedinUrl: "https://www.linkedin.com/company/empatixdev/",
      telegramUrl: "https://t.me/+nRHlPuQkjbY3ODMy",
      whatsappUrl: "https://wa.me/37124965140",
      copyright: "© 2026 Empatix. All rights reserved.",
    },
  },
  {
    key: "navigation",
    label: "Navigation",
    description: "Top navigation labels (JSON list).",
    fields: [
      { key: "items", label: "Items (JSON array of {label,href})", type: "textarea" },
    ],
    defaults: {
      items: JSON.stringify(
        [
          { label: "Services", href: "/services" },
          { label: "AI Solutions", href: "/ai-solutions" },
          { label: "Cases", href: "/cases" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
        null,
        2,
      ),
    },
  },
  {
    key: "why_empatix",
    label: "Why Empatix",
    description: "Why-Empatix block with bullet list.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "points", label: "Bullet points (one per line)", type: "textarea" },
    ],
    defaults: {
      eyebrow: "Why Empatix",
      title: "One partner for product, AI and automation",
      body: "Most teams have to choose between a product studio, an AI lab and an automation shop. With Empatix it's one team — so discovery, build and the messy bits in between stay with people who actually own the outcome",
      points: [
        "Business analysis & product thinking",
        "AI expertise — RAG, agents, document analysis",
        "Automation engineering with n8n, Zapier and Node.js",
        "CTO-level guidance and delivery ownership",
        "End-to-end delivery — from discovery to support",
        "Production experience in fintech, CRM and SaaS",
      ].join("\n"),
    },
  },
  {
    key: "process",
    label: "Process",
    description: "Process steps (up to 6). Leave a step's title empty to hide it.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "step1Title", label: "Step 1 — title", type: "text" },
      { key: "step1Body", label: "Step 1 — body", type: "textarea" },
      { key: "step2Title", label: "Step 2 — title", type: "text" },
      { key: "step2Body", label: "Step 2 — body", type: "textarea" },
      { key: "step3Title", label: "Step 3 — title", type: "text" },
      { key: "step3Body", label: "Step 3 — body", type: "textarea" },
      { key: "step4Title", label: "Step 4 — title", type: "text" },
      { key: "step4Body", label: "Step 4 — body", type: "textarea" },
      { key: "step5Title", label: "Step 5 — title (optional)", type: "text" },
      { key: "step5Body", label: "Step 5 — body (optional)", type: "textarea" },
      { key: "step6Title", label: "Step 6 — title (optional)", type: "text" },
      { key: "step6Body", label: "Step 6 — body (optional)", type: "textarea" },
    ],
    defaults: {
      eyebrow: "How we work",
      title: "A simple four-step process",
      step1Title: "Discovery",
      step1Body: "Understand the goal, the users and what's actually feasible",
      step2Title: "Design",
      step2Body: "UX/UI, architecture and a roadmap you can defend",
      step3Title: "Build",
      step3Body: "Engineering, integrations and AI — shipped in weekly demos",
      step4Title: "Launch",
      step4Body: "QA, deployment, monitoring and support after go-live",
      step5Title: "",
      step5Body: "",
      step6Title: "",
      step6Body: "",
    },
  },
  {
    key: "final_cta",
    label: "Final CTA",
    description: "Closing call-to-action block.",
    fields: [
      { key: "title", label: "Title", type: "textarea" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "primaryLabel", label: "Primary button label", type: "text" },
      { key: "primaryHref", label: "Primary button link", type: "url" },
      { key: "secondaryLabel", label: "Secondary button label", type: "text" },
      { key: "secondaryHref", label: "Secondary button link", type: "url" },
    ],
    defaults: {
      title: "Find the highest-leverage thing to automate first",
      body: "Book a free 30-minute call. You walk away with a clear next step — whether that's a quick automation, a focused AI prototype or a paid discovery for something bigger",
      primaryLabel: "Book a 30-min call",
      primaryHref: "/contact",
      secondaryLabel: "See what we do",
      secondaryHref: "/services",
    },
  },
  {
    key: "seo_home",
    label: "SEO — Home",
    description: "Meta tags for the homepage.",
    fields: [
      { key: "title", label: "Meta title", type: "text" },
      { key: "description", label: "Meta description", type: "textarea" },
      { key: "canonical", label: "Canonical URL", type: "url" },
      { key: "ogTitle", label: "Open Graph title", type: "text" },
      { key: "ogDescription", label: "Open Graph description", type: "textarea" },
      { key: "ogImage", label: "Open Graph image", type: "image" },
    ],
    defaults: {
      title: "Empatix — Ship AI products. Automate the work behind them",
      description:
        "Empatix helps operations and product teams turn manual work into software.",
      canonical: "/",
      ogTitle: "Empatix",
      ogDescription: "AI products, automations and fractional CTO guidance.",
      ogImage: "",
    },
  },
  {
    key: "services_header",
    label: "Services — Header",
    description: "Eyebrow, title and link above the services grid.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "linkLabel", label: "Link label", type: "text" },
      { key: "linkHref", label: "Link URL", type: "url" },
    ],
    defaults: {
      eyebrow: "What we do",
      title: "Four ways we work with you",
      linkLabel: "See all services",
      linkHref: "/services",
    },
  },
  {
    key: "cases_header",
    label: "Featured Cases — Header",
    description: "Eyebrow, title and link above the featured cases grid.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
      { key: "linkLabel", label: "Link label", type: "text" },
      { key: "linkHref", label: "Link URL", type: "url" },
    ],
    defaults: {
      eyebrow: "Recent work",
      title: "Products we shipped lately",
      linkLabel: "See all work",
      linkHref: "/cases",
    },
  },
  {
    key: "value_props_header",
    label: "Value Propositions — Header",
    description: "Eyebrow and title above the value propositions list.",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Title", type: "textarea" },
    ],
    defaults: {
      eyebrow: "How we help",
      title: "From idea to product. From manual work to automation. From data to AI",
    },
  },
  {
    key: "about_intro",
    label: "About — Intro",
    description: "Three intro paragraphs shown under the About hero.",
    fields: [
      { key: "para1", label: "Paragraph 1", type: "textarea" },
      { key: "para2", label: "Paragraph 2", type: "textarea" },
      { key: "para3", label: "Paragraph 3", type: "textarea" },
      { key: "stats", label: "Stats", type: "stats", help: "Add, remove, or drag to reorder. Each stat has a value (big text) and a label (small text)." },
    ],
    defaults: {
      para1:
        "Empatix was founded by engineers and product builders who spent years inside fintech, healthcare, retail and SaaS companies — shipping the AI pipelines, internal tools and automations that quietly keep a business running",
      para2:
        "Today we package that experience into focused engagements: building AI-powered products, taking manual work off your team's plate, and acting as a fractional CTO for founders who need senior technical leadership without a full-time hire",
      para3:
        "We work best with funded startups, scale-ups and SMEs that have a real business problem to solve — and want a partner who treats the product like their own",
      stats: [
        { value: "8+", label: "years building products" },
        { value: "40+", label: "shipped products & integrations" },
        { value: "12", label: "industries served" },
        { value: "100%", label: "senior engineers" },
      ],
    },
  },

  {
    key: "about_values_header",
    label: "About — Why teams choose Empatix (header)",
    description: "Title above the Why teams choose Empatix grid.",
    fields: [
      { key: "title", label: "Title", type: "text" },
    ],
    defaults: { title: "Why teams choose Empatix" },
  },
  {
    key: "team_header",
    label: "About — Team header",
    description: "Title and intro above the team grid.",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    defaults: {
      title: "The people you'll work with",
      description:
        "A senior team across engineering, product, design and delivery — the same people you meet on day one stay on the project",
    },
  },
  // ---- Per-page hero + CTA sections (visual editor on inner pages) ----
  ...pageHeroAndCtaSections(),
];


type HeroDefaults = {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
};
type CtaDefaults = { title: string; body?: string; buttonLabel: string; buttonHref: string };

function heroSection(
  key: string,
  label: string,
  defaults: HeroDefaults,
  opts: { withCtas?: boolean } = {},
): SectionDef {
  const baseFields: FieldDef[] = [
    { key: "eyebrow", label: "Eyebrow", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "titleAccent", label: "Title — accent (gradient, optional)", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
  ];
  const ctaFields: FieldDef[] = opts.withCtas
    ? [
        { key: "ctaPrimaryLabel", label: "Primary button — label", type: "text" },
        { key: "ctaPrimaryHref", label: "Primary button — link", type: "url" },
        { key: "ctaSecondaryLabel", label: "Secondary button — label (optional)", type: "text" },
        { key: "ctaSecondaryHref", label: "Secondary button — link (optional)", type: "url" },
      ]
    : [];
  return {
    key,
    label,
    description: "Hero section — eyebrow, title, accent and description.",
    fields: [...baseFields, ...ctaFields],
    defaults: {
      eyebrow: "",
      titleAccent: "",
      description: "",
      ...(opts.withCtas
        ? { ctaPrimaryLabel: "", ctaPrimaryHref: "", ctaSecondaryLabel: "", ctaSecondaryHref: "" }
        : {}),
      ...defaults,
    },
  };
}

function ctaSection(key: string, label: string, defaults: CtaDefaults): SectionDef {
  return {
    key,
    label,
    description: "Bottom call-to-action block.",
    fields: [
      { key: "title", label: "Title", type: "textarea" },
      { key: "body", label: "Body (optional)", type: "textarea" },
      { key: "buttonLabel", label: "Button label", type: "text" },
      { key: "buttonHref", label: "Button URL", type: "url" },
    ],
    defaults: { body: "", ...defaults },
  };
}

function pageHeroAndCtaSections(): SectionDef[] {
  return [
    heroSection(
      "services_page_hero",
      "Services — Hero",
      {
        eyebrow: "Services",
        title: "One partner for",
        titleAccent: "product, AI and automation",
        description:
          "Product discovery, business analysis, CTO guidance, engineering, AI and automation — under a single accountable team",
        ctaPrimaryLabel: "Book a 30-min call",
        ctaPrimaryHref: "/contact",
        ctaSecondaryLabel: "See recent work",
        ctaSecondaryHref: "/cases",
      },
      { withCtas: true },
    ),
    ctaSection("services_page_cta", "Services — Bottom CTA", {
      title: "Not sure which service fits your problem?",
      body: "Tell us what's slowing the team down — we'll point to the shortest path forward, even if it's smaller than you expected",
      buttonLabel: "Book a 30-min call",
      buttonHref: "/contact",
    }),
    {
      key: "services_assurance",
      label: "Services — What you get / What you don't",
      description: "Two-column assurance block shown between the comparison matrix and the bottom CTA. Reduces buyer anxiety before they request an estimate.",
      fields: [
        { key: "eyebrow", label: "Eyebrow", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "subtitle", label: "Subtitle", type: "textarea" },
        { key: "getTitle", label: "Left column title", type: "text" },
        { key: "getList", label: "What you get (one item per line)", type: "textarea" },
        { key: "avoidTitle", label: "Right column title", type: "text" },
        { key: "avoidList", label: "What you don't get (one item per line)", type: "textarea" },
      ],
      defaults: {
        eyebrow: "Before you ask for an estimate",
        title: "What you get — and what you don't",
        subtitle: "Straight talk so you know what you're buying before the first call.",
        getTitle: "What you get",
        getList: "A senior team — no juniors hidden on the bill\nA CTO in the room on every engagement\nWeekly demos and a shared backlog you can read\nFixed-scope MVPs with clear acceptance criteria\nClean handover: code, docs, infra, ownership",
        avoidTitle: "What you don't get",
        avoidList: "No staff-augmentation body-shop\nNo open-ended retainers without a scope\nNo lock-in: you own the code and the infra\nNo PowerPoint-only deliverables\nNo agency layers between you and the engineer",
      },
    },


    heroSection(
      "ai_solutions_hero",
      "AI Solutions — Hero",
      {
        eyebrow: "AI Solutions",
        title: "AI where it actually",
        titleAccent: "earns its place",
        description:
          "Practical AI inside the workflows your team already runs — assistants, document analysis, sales automation and mentors, trained on your own data",
        ctaPrimaryLabel: "Scope an AI prototype",
        ctaPrimaryHref: "/contact",
      },
      { withCtas: true },
    ),
    ctaSection("ai_solutions_cta", "AI Solutions — Bottom CTA", {
      title: "Prove one AI use case in weeks, not months",
      body: "We pick one small, high-impact use case from your docs, CRM or website — and ship a working prototype with real metrics behind it",
      buttonLabel: "Scope a PoC with us",
      buttonHref: "/contact",
    }),


    heroSection("cases_page_hero", "Cases — Hero", {
      eyebrow: "Recent work",
      title: "Products and automations",
      titleAccent: "we've shipped",
      description:
        "A selection of products, AI prototypes and automations we've delivered for fintech, legal, SaaS, sales and operations teams",
    }),
    ctaSection("cases_page_cta", "Cases — Bottom CTA", {
      title: "Have a similar problem in mind?",
      body: "",
      buttonLabel: "Book a 30-min call",
      buttonHref: "/contact",
    }),

    heroSection("industries_hero", "Industries — Hero", {
      eyebrow: "Industries",
      title: "Industries we",
      titleAccent: "know well",
      description:
        "We focus on domains where AI, automation and product engineering move the needle — and we've shipped real production work in each of them",
    }),
    ctaSection("industries_cta", "Industries — Bottom CTA", {
      title: "Don't see your industry? Let's talk anyway",
      body: "If the problem is repetitive work, scattered tools or an AI idea worth proving — chances are we've built something close to it before",
      buttonLabel: "Book a 30-min call",
      buttonHref: "/contact",
    }),

    heroSection("how_we_work_hero", "How We Work — Hero", {
      eyebrow: "How we work",
      title: "How a project",
      titleAccent: "actually runs",
      description:
        "Built around outcomes, not hours — with clear milestones, weekly demos and a single accountable team from day one",
    }),
    ctaSection("how_we_work_cta", "How We Work — Bottom CTA", {
      title: "Start with a free 30-minute call",
      body: "",
      buttonLabel: "Book your call",
      buttonHref: "/contact",
    }),

    heroSection("about_hero", "About — Hero", {
      eyebrow: "About Empatix",
      title: "Your partner for",
      titleAccent: "AI products and business automation",
      description:
        "From first idea to live software — we build AI products, automate the manual work and bring senior engineering and CTO-level guidance into your team.",
    }),
    ctaSection("about_cta", "About — Bottom CTA", {
      title: "Let's see if we're the right fit",
      body: "",
      buttonLabel: "Book a 30-min call",
      buttonHref: "/contact",
    }),

    heroSection("insights_hero", "Insights — Hero", {
      eyebrow: "Insights",
      title: "Field notes on",
      titleAccent: "AI, automation & product",
      description:
        "We publish what we learn shipping AI products, automating operations and advising founders",
    }),
    ctaSection("insights_cta", "Insights — Bottom CTA", {
      title: "Want this kind of thinking applied to your business?",
      body: "We turn the same ideas you read here into shipped AI products and automations — let's see where they fit for your team",
      buttonLabel: "Book a 30-min call",
      buttonHref: "/contact",
    }),

    heroSection(
      "contact_hero",
      "Contact — Hero",
      {
        eyebrow: "Contact",
        title: "Let's",
        titleAccent: "build something useful",
        description:
          "Tell us about your product, process or AI idea. We'll reply within one business day and set up a free 30-minute call",
        ctaPrimaryLabel: "Get a quick estimate",
        ctaPrimaryHref: "https://quotes.empatixtech.com/",
      },
      { withCtas: true },
    ),
    {
      key: "contact_form",
      label: "Contact — Form",
      description: "Headings, helper text, interest tags and success message on the contact form.",
      fields: [
        { key: "heading", label: "Form heading", type: "text" },
        { key: "subheading", label: "Subheading", type: "text" },
        { key: "interestsLabel", label: "Interests label", type: "text" },
        { key: "interests", label: "Interest tags (one per line)", type: "textarea" },
        { key: "contextLabel", label: "Context field label", type: "text" },
        { key: "contextPlaceholder", label: "Context field placeholder", type: "text" },
        { key: "submitLabel", label: "Submit button label", type: "text" },
        { key: "successTitle", label: "Success title", type: "text" },
        { key: "successBody", label: "Success body", type: "textarea" },
      ],
      defaults: {
        heading: "Start the conversation",
        subheading: "Free 30-minute call. No deck, no pressure",
        interestsLabel: "I'd like to talk about",
        interests: "AI Solution\nAutomation\nMVP / Product\nCTO Advisory\nOther",
        contextLabel: "A bit of context",
        contextPlaceholder: "What's the product, problem or process on your mind?",
        submitLabel: "Send and request a call",
        successTitle: "Thanks — got it",
        successBody: "We'll get back to you within one business day. Taking you back…",
      },
    },
    {
      key: "contact_details",
      label: "Contact — Details",
      description: "Email, phone, address and social channels shown beside the form.",
      fields: [
        { key: "email", label: "Email", type: "text" },
        { key: "emailNote", label: "Email — note", type: "text" },
        { key: "phone", label: "Phone (display)", type: "text" },
        { key: "phoneHref", label: "Phone (tel: link)", type: "text" },
        { key: "phoneNote", label: "Phone — note", type: "text" },
        { key: "address", label: "Address", type: "textarea" },
        { key: "addressNote", label: "Address — note", type: "text" },
        { key: "linkedinUrl", label: "LinkedIn URL", type: "url" },
        { key: "linkedinNote", label: "LinkedIn — note", type: "text" },
        { key: "telegramUrl", label: "Telegram URL", type: "url" },
        { key: "telegramNote", label: "Telegram — note", type: "text" },
        { key: "whatsappUrl", label: "WhatsApp URL", type: "url" },
        { key: "whatsappNote", label: "WhatsApp — note", type: "text" },
      ],
      defaults: {
        email: "sales@empatixtech.com",
        emailNote: "Send a short brief — we reply within one business day",
        phone: "+371 24965 140",
        phoneHref: "tel:+37124965140",
        phoneNote: "Reach us during EU working hours",
        address: "Pērnavas iela 21–22, Rīga, LV-1009, Latvia",
        addressNote: "Empatix HQ — Riga, Latvia",
        linkedinUrl: "https://www.linkedin.com/company/empatixdev/",
        linkedinNote: "Follow us for case studies and product notes",
        telegramUrl: "https://t.me/+nRHlPuQkjbY3ODMy",
        telegramNote: "Quickest way to start a conversation",
        whatsappUrl: "https://wa.me/37124965140",
        whatsappNote: "Send a message — we usually reply same day",
      },
    },
  ];
}

// ---- Collections ----
export const COLLECTIONS: CollectionDef[] = [
  {
    key: "services",
    label: "Services",
    description: "Service offerings shown on the home page.",
    titleField: "title",
    headerSection: "services_header",
    fields: [
      { key: "number", label: "Number (e.g. 01)", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "linkHref", label: "Link URL", type: "url" },
      { key: "tags", label: "Tags (one per line)", type: "textarea" },
    ],
    defaults: { number: "01", title: "New service", summary: "", linkHref: "/services", tags: "" },
  },
  {
    key: "value_props",
    label: "Value Propositions",
    description: "Value propositions and benefits.",
    titleField: "title",
    headerSection: "value_props_header",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "icon", label: "Icon", type: "icon" },
    ],
    defaults: { title: "", description: "", icon: "Compass" },
  },
  {
    key: "team",
    label: "Team",
    description: "Team members.",
    titleField: "name",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "photo", label: "Photo", type: "image" },
      { key: "linkedin", label: "LinkedIn URL", type: "url" },
    ],
    defaults: { name: "", role: "", bio: "", photo: "", linkedin: "" },
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description: "Client testimonials.",
    titleField: "author",
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "author", label: "Author", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "photo", label: "Photo", type: "image" },
    ],
    defaults: { quote: "", author: "", role: "", company: "", photo: "" },
  },
  {
    key: "case_studies",
    label: "Case Studies",
    description: "Featured case cards shown on the home page.",
    titleField: "name",
    headerSection: "cases_header",
    imageField: "image",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "kind", label: "Kind / category", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "outcome", label: "Outcome (one-line result)", type: "text", help: "Short, concrete result shown on the card, e.g. '−70% review time' or '3× SDR throughput'." },
      { key: "image", label: "Cover image", type: "image" },
      { key: "chips", label: "Chips (one per line)", type: "textarea" },
    ],
    defaults: { name: "", kind: "", summary: "", outcome: "", image: "", chips: "" },
  },
  {
    key: "cases_page_items",
    label: "Cases — Items",
    description: "Full case cards listed on the Cases page (Products & Cases).",
    titleField: "name",
    headerSection: "cases_page_hero",
    imageField: "image",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "kind", label: "Category / kind", type: "text", suggestionsFromSiblings: true, help: "Used as the case category on /cases. Pick an existing one from the dropdown or type a new value." },
      { key: "client", label: "The problem", type: "textarea" },
      { key: "solution", label: "What we built", type: "textarea" },
      { key: "chips", label: "Chips (one per line)", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
      { key: "image2", label: "Extra image #2 (optional)", type: "image" },
      { key: "image3", label: "Extra image #3 (optional)", type: "image" },
      { key: "details", label: "Detailed description (modal)", type: "textarea" },
      { key: "outcomes", label: "Outcomes / results (one per line)", type: "textarea" },
      { key: "demo", label: "Live demo URL (optional)", type: "url" },
      { key: "askLabel", label: "Ask button — label", type: "text" },
      { key: "askHref", label: "Ask button — link", type: "url" },
    ],
    defaults: { name: "New case", kind: "", client: "", solution: "", chips: "", image: "", image2: "", image3: "", details: "", outcomes: "", demo: "", askLabel: "Ask about it", askHref: "/contact" },
  },
  {
    key: "portfolio",
    label: "Portfolio",
    description: "Portfolio projects.",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "url", label: "Link", type: "url" },
      { key: "image", label: "Image", type: "image" },
    ],
    defaults: { title: "", description: "", url: "", image: "" },
  },
  {
    key: "client_logos",
    label: "Client Logos",
    description: "Logos shown in the client carousel.",
    titleField: "name",
    fields: [
      { key: "name", label: "Client name", type: "text" },
      { key: "logo", label: "Logo image", type: "image" },
      { key: "url", label: "Website URL", type: "url" },
    ],
    defaults: { name: "", logo: "", url: "" },
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Frequently asked questions.",
    titleField: "question",
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "richtext" },
    ],
    defaults: { question: "", answer: "" },
  },
  {
    key: "services_offerings",
    label: "Services — Offerings",
    description: "Detailed service blocks listed on the Services page.",
    titleField: "title",
    fields: [
      { key: "anchor", label: "Anchor ID (e.g. product, ai, automation)", type: "text" },
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title", type: "text" },
      { key: "pitch", label: "Pitch", type: "textarea" },
      { key: "forWhom", label: "Who it's for (1 short sentence)", type: "textarea", help: "Shown in the comparison matrix row 'Who it's for'." },
      { key: "timeline", label: "Typical timeline (e.g. 6–12 weeks)", type: "text", help: "Shown as a colored pill in the matrix." },
      { key: "buildList", label: "We build / Core deliverables (one item per line)", type: "textarea" },
      { key: "includes", label: "What's included (one item per line)", type: "textarea" },
      { key: "proofMetric", label: "Social proof — metric", type: "text", help: "Short metric chip shown in the matrix Proof row, e.g. '−60% manual ops time'." },
      { key: "proofQuote", label: "Social proof — quote", type: "textarea", help: "Short client quote (1 sentence). Leave empty to hide." },
      { key: "proofAuthor", label: "Social proof — author / role", type: "text", help: "e.g. 'COO, FinCRM'." },
      { key: "image", label: "Decorative image (auto opacity)", type: "image" },
      { key: "linkLabel", label: "Bottom link — label", type: "text" },
      { key: "linkHref", label: "Bottom link — URL", type: "url" },
    ],
    defaults: {
      anchor: "service",
      icon: "Layers",
      title: "New service",
      pitch: "",
      forWhom: "",
      timeline: "",
      buildList: "",
      includes: "",
      proofMetric: "",
      proofQuote: "",
      proofAuthor: "",
      image: "",
      linkLabel: "Discuss this service",
      linkHref: "/contact",
    },

  },
  {
    key: "ai_solutions_cards",
    label: "AI Solutions — Cards",
    description: "Cards shown on the AI Solutions page.",
    titleField: "title",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "metric", label: "Metric (big number)", type: "text" },
      { key: "metricLabel", label: "Metric label", type: "text" },
      { key: "tags", label: "Tags (one per line)", type: "textarea" },
      { key: "image", label: "Decorative image (auto opacity)", type: "image" },
      { key: "step1Icon", label: "Step 1 — icon", type: "icon" },
      { key: "step1Label", label: "Step 1 — label", type: "text" },
      { key: "step2Icon", label: "Step 2 — icon", type: "icon" },
      { key: "step2Label", label: "Step 2 — label", type: "text" },
      { key: "step3Icon", label: "Step 3 — icon", type: "icon" },
      { key: "step3Label", label: "Step 3 — label", type: "text" },
    ],
    defaults: {
      icon: "Sparkles",
      title: "New AI solution",
      summary: "",
      metric: "10×",
      metricLabel: "faster than before",
      tags: "AI\nWorkflow",
      image: "",
      step1Icon: "Upload",
      step1Label: "Ingest",
      step2Icon: "Layers",
      step2Label: "Index",
      step3Icon: "Search",
      step3Label: "Cite",
    },
  },
  {
    key: "industries_items",
    label: "Industries — Items",
    description: "Industry cards shown on the Industries page.",
    titleField: "title",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    defaults: { icon: "Briefcase", title: "New industry", description: "" },
  },
  {
    key: "how_we_work_steps",
    label: "How We Work — Steps",
    description: "Process steps shown on the How We Work page.",
    titleField: "title",
    fields: [
      { key: "number", label: "Number (e.g. 01)", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "deliverables", label: "Deliverables (one per line)", type: "textarea" },
    ],
    defaults: { number: "01", title: "New step", body: "", deliverables: "" },
  },
  {
    key: "about_values",
    label: "About — Why teams choose Empatix",
    description: "Value cards under the About page intro.",
    titleField: "title",
    headerSection: "about_values_header",
    fields: [
      { key: "icon", label: "Icon", type: "icon" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    defaults: { icon: "Target", title: "New value", description: "" },
  },
  {
    key: "insights_items",
    label: "Insights — Articles",
    description: "Blog posts listed on the Insights page.",
    titleField: "title",
    headerSection: "insights_hero",
    imageField: "image",
    fields: [
      { key: "slug", label: "Slug (URL)", type: "text", help: "Used in /insights/<slug>. Must be unique." },
      { key: "title", label: "Title", type: "text" },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "image", label: "Cover image", type: "image" },
      { key: "date", label: "Date (e.g. Sep 16, 2025)", type: "text" },
      { key: "categories", label: "Categories (one per line)", type: "textarea", help: "FinTech, Blockchain, WEB3, Management, AI" },
      { key: "category", label: "Primary category (for SEO)", type: "text" },
      { key: "readMin", label: "Read time (minutes)", type: "number" },
      { key: "author", label: "Author", type: "text" },
    ],
    defaults: {
      slug: "new-article",
      title: "New article",
      excerpt: "",
      image: "",
      date: "",
      categories: "AI",
      category: "AI",
      readMin: 5,
      author: "Empatix",
    },
  },
  {
    key: "trust_metrics",
    label: "Trust — Metrics",
    description: "Big-number metrics shown under the hero (e.g. 47 products shipped, 4+ yrs, NPS 72).",
    titleField: "label",
    headerSection: "trust_strip",
    fields: [
      { key: "value", label: "Value (e.g. 47, 120M, 4.9)", type: "text", help: "Number only — the animated CountUp parses digits. Suffix like '+', 'M', 'K' is supported." },
      { key: "prefix", label: "Prefix (optional, e.g. $)", type: "text" },
      { key: "label", label: "Label (e.g. products shipped)", type: "text" },
    ],
    defaults: { value: "10+", prefix: "", label: "new metric" },
  },
  {
    key: "trust_logos",
    label: "Trust — Client logos",
    description: "Client / partner logos shown under the metrics. Upload SVG or transparent PNG for best result.",
    titleField: "name",
    imageField: "logo",
    fields: [
      { key: "name", label: "Client name", type: "text" },
      { key: "logo", label: "Logo (SVG or transparent PNG)", type: "image", help: "Will be displayed monochrome and tinted to match the theme." },
      { key: "url", label: "Optional link", type: "url" },
    ],
    defaults: { name: "Client", logo: "", url: "" },
  },
];


export function getSection(key: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.key === key);
}

export function getCollection(key: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}
