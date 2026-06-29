INSERT INTO content_sections (key, data, status)
VALUES ('trust_strip', jsonb_build_object('showLogos', false), 'published')
ON CONFLICT (key) DO UPDATE SET data = content_sections.data || jsonb_build_object('showLogos', false), updated_at = now();