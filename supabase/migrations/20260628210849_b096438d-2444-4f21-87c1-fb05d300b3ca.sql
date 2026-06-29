update public.content_sections
set data = data
  || jsonb_build_object(
    'headline', 'Ship the AI products, automations and internal tools that quietly run your business',
    'subheadline', 'We pair senior engineers with a CTO in the room to design, ship and run software that cuts manual ops, replaces brittle spreadsheets and turns AI ideas into things your team actually uses — in weeks, not quarters.',
    'proofMetric', '−60% manual ops time',
    'proofText', 'after we shipped an internal ops tool in 9 weeks',
    'proofCaseLabel', 'See the case',
    'proofCaseHref', '/cases'
  )
where key = 'hero';