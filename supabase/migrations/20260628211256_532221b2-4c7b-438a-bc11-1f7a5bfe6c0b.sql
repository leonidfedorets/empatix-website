-- Seed assurance section
insert into public.content_sections (key, data, status)
values (
  'services_assurance',
  jsonb_build_object(
    'eyebrow', 'Before you ask for an estimate',
    'title', 'What you get — and what you don''t',
    'subtitle', 'Straight talk so you know what you''re buying before the first call.',
    'getTitle', 'What you get',
    'getList', 'A senior team — no juniors hidden on the bill
A CTO in the room on every engagement
Weekly demos and a shared backlog you can read
Fixed-scope MVPs with clear acceptance criteria
Clean handover: code, docs, infra, ownership',
    'avoidTitle', 'What you don''t get',
    'avoidList', 'No staff-augmentation body-shop
No open-ended retainers without a scope
No lock-in: you own the code and the infra
No PowerPoint-only deliverables
No agency layers between you and the engineer'
  ),
  'published'
)
on conflict (key) do update set data = excluded.data, updated_at = now();

-- Seed proof per service offering (only where not already set)
update public.content_items set data = data || jsonb_build_object(
  'proofMetric', '−60% manual ops time',
  'proofQuote', 'They shipped our internal ops tool in 9 weeks — the team stopped living in spreadsheets.',
  'proofAuthor', 'COO, ops-heavy SaaS'
) where collection = 'services_offerings' and (data->>'anchor') = 'product' and coalesce(data->>'proofMetric','') = '';

update public.content_items set data = data || jsonb_build_object(
  'proofMetric', '3× faster contract review',
  'proofQuote', 'The RAG assistant actually moved a metric — our analysts read 3× more contracts per week.',
  'proofAuthor', 'Head of Legal Ops'
) where collection = 'services_offerings' and (data->>'anchor') = 'ai' and coalesce(data->>'proofMetric','') = '';

update public.content_items set data = data || jsonb_build_object(
  'proofMetric', '12 hrs/week saved',
  'proofQuote', 'Copy-paste between CRM and sheets is gone. Sales just sells now.',
  'proofAuthor', 'RevOps Lead'
) where collection = 'services_offerings' and (data->>'anchor') = 'automation' and coalesce(data->>'proofMetric','') = '';

update public.content_items set data = data || jsonb_build_object(
  'proofMetric', 'Investor-ready in 4 weeks',
  'proofQuote', 'Having a real CTO voice in the room got our architecture and roadmap through DD without rework.',
  'proofAuthor', 'Founder, seed-stage'
) where collection = 'services_offerings' and (data->>'anchor') = 'cto' and coalesce(data->>'proofMetric','') = '';