-- ============================================================
-- Empatix Website — Full schema setup for a fresh Supabase project
-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rdxnmouywlqerkeyemca/sql
-- ============================================================

-- Step 1: Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- Step 2: Helper trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Step 3: User roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Private schema for security-definer helpers
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin')
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;

-- Step 5: RLS policies for user_roles
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE POLICY "super admin manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Step 6: Bootstrap trigger (auto-grants super_admin on first sign-in)
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IN ('lapusto.v@empatixtech.com', 'leonidfedorets30@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.bootstrap_super_admin() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER bootstrap_super_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_super_admin();

-- Step 7: Content sections (singleton page blocks)
CREATE TABLE public.content_sections (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'published',
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_sections TO authenticated;
GRANT ALL ON public.content_sections TO service_role;
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read sections" ON public.content_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write sections" ON public.content_sections FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE TRIGGER content_sections_updated_at BEFORE UPDATE ON public.content_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_sections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_sections;

-- Step 8: Content items (collection page blocks)
CREATE TABLE public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  version integer NOT NULL DEFAULT 1,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_items_collection_idx ON public.content_items (collection, sort_order);
GRANT SELECT ON public.content_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published items" ON public.content_items FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "admins read all items" ON public.content_items FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "admins write items" ON public.content_items FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

CREATE TRIGGER content_items_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.content_items;

-- Step 9: Media assets
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  public_url text NOT NULL,
  mime text,
  width integer,
  height integer,
  size_bytes bigint,
  alt text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read media" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins write media" ON public.media_assets FOR ALL TO authenticated
  USING (private.is_admin(auth.uid())) WITH CHECK (private.is_admin(auth.uid()));

-- Step 10: Audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  entity_type text NOT NULL,
  entity_id text,
  action text NOT NULL,
  diff jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read audit" ON public.audit_log FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

-- Step 11: Storage bucket + policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "admins manage media objects" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media' AND private.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'media' AND private.is_admin(auth.uid()));

CREATE POLICY "public read media objects" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');
