-- 1. Private schema for security-definer helpers (not exposed to PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Recreate helpers inside `private`
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','super_admin')
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;

-- 3. Rewrite policies to use private.*
-- user_roles
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "super admin manage roles" ON public.user_roles;
CREATE POLICY "super admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- content_sections
DROP POLICY IF EXISTS "admins write sections" ON public.content_sections;
CREATE POLICY "admins write sections" ON public.content_sections
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- content_items
DROP POLICY IF EXISTS "admins write items" ON public.content_items;
CREATE POLICY "admins write items" ON public.content_items
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins read all items" ON public.content_items;
CREATE POLICY "admins read all items" ON public.content_items
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

-- media_assets
DROP POLICY IF EXISTS "admins write media" ON public.media_assets;
CREATE POLICY "admins write media" ON public.media_assets
  FOR ALL TO authenticated
  USING (private.is_admin(auth.uid()))
  WITH CHECK (private.is_admin(auth.uid()));

-- audit_log
DROP POLICY IF EXISTS "admins read audit" ON public.audit_log;
CREATE POLICY "admins read audit" ON public.audit_log
  FOR SELECT TO authenticated
  USING (private.is_admin(auth.uid()));

-- storage.objects (media bucket)
DROP POLICY IF EXISTS "admins manage media objects" ON storage.objects;
CREATE POLICY "admins manage media objects" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'media' AND private.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'media' AND private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins read media objects" ON storage.objects;
CREATE POLICY "admins read media objects" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND private.is_admin(auth.uid()));

-- 4. Drop public copies now that nothing references them
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
