CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) AND NOT EXISTS (SELECT 1 FROM public.admin_access WHERE user_id = _user_id AND NOT active) $$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.protect_last_administrator() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid; excluded_id uuid; remaining integer; removing boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(578492106);
 IF TG_TABLE_NAME = 'user_roles' THEN
  target := OLD.user_id; excluded_id := OLD.id;
  IF TG_OP = 'DELETE' THEN removing := OLD.role IN ('admin','super_admin'); ELSE removing := OLD.role IN ('admin','super_admin') AND (NEW.role NOT IN ('admin','super_admin') OR NEW.user_id <> OLD.user_id); END IF;
 ELSE target := NEW.user_id; removing := NOT NEW.active; END IF;
 IF removing AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = target AND r.role IN ('admin','super_admin')) AND NOT EXISTS (SELECT 1 FROM public.admin_access a WHERE a.user_id = target AND NOT a.active) THEN
  SELECT count(DISTINCT r.user_id) INTO remaining FROM public.user_roles r WHERE r.role IN ('admin','super_admin') AND NOT EXISTS (SELECT 1 FROM public.admin_access a WHERE a.user_id = r.user_id AND NOT a.active) AND (r.user_id <> target OR (excluded_id IS NOT NULL AND r.id <> excluded_id));
  IF remaining = 0 THEN RAISE EXCEPTION 'Cannot remove or block the last active administrator'; END IF;
 END IF;
 IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
REVOKE ALL ON FUNCTION public.protect_last_administrator() FROM PUBLIC, anon, authenticated;
CREATE POLICY "editors update own media descriptions" ON public.media_assets FOR UPDATE TO authenticated USING (uploaded_by = auth.uid() AND public.can_edit_insights()) WITH CHECK (uploaded_by = auth.uid() AND public.can_edit_insights());