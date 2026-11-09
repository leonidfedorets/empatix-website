CREATE TABLE public.admin_access (user_id uuid PRIMARY KEY, active boolean NOT NULL DEFAULT true);
GRANT SELECT ON public.admin_access TO authenticated;
GRANT ALL ON public.admin_access TO service_role;
ALTER TABLE public.admin_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own access" ON public.admin_access FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = _user_id AND r.role IN ('admin','super_admin')) AND NOT EXISTS (SELECT 1 FROM public.admin_access a WHERE a.user_id = _user_id AND NOT a.active) $$;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.can_edit_insights() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('editor','admin','super_admin')) AND NOT EXISTS (SELECT 1 FROM public.admin_access WHERE user_id = auth.uid() AND NOT active) $$;
REVOKE ALL ON FUNCTION public.can_edit_insights() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_edit_insights() TO authenticated, service_role;
CREATE POLICY "editors manage insights" ON public.content_items FOR ALL TO authenticated USING (collection = 'insights_items' AND public.can_edit_insights()) WITH CHECK (collection = 'insights_items' AND public.can_edit_insights());
CREATE POLICY "editors read media" ON public.media_assets FOR SELECT TO authenticated USING (public.can_edit_insights());
CREATE OR REPLACE FUNCTION public.protect_last_administrator() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid; remaining integer; removing boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(578492106);
 IF TG_TABLE_NAME = 'user_roles' THEN
  target := OLD.user_id;
  IF TG_OP = 'DELETE' THEN removing := OLD.role IN ('admin','super_admin'); ELSE removing := OLD.role IN ('admin','super_admin') AND (NEW.role NOT IN ('admin','super_admin') OR NEW.user_id <> OLD.user_id); END IF;
 ELSE target := NEW.user_id; removing := NOT NEW.active; END IF;
 IF removing AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = target AND r.role IN ('admin','super_admin')) AND NOT EXISTS (SELECT 1 FROM public.admin_access a WHERE a.user_id = target AND NOT a.active) THEN
  SELECT count(DISTINCT r.user_id) INTO remaining FROM public.user_roles r WHERE r.role IN ('admin','super_admin') AND NOT EXISTS (SELECT 1 FROM public.admin_access a WHERE a.user_id = r.user_id AND NOT a.active) AND (r.user_id <> target OR (TG_TABLE_NAME = 'user_roles' AND r.id <> OLD.id));
  IF remaining = 0 THEN RAISE EXCEPTION 'Cannot remove or block the last active administrator'; END IF;
 END IF;
 IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
REVOKE ALL ON FUNCTION public.protect_last_administrator() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER protect_last_admin_role BEFORE DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.protect_last_administrator();
CREATE TRIGGER protect_last_admin_access BEFORE INSERT OR UPDATE ON public.admin_access FOR EACH ROW EXECUTE FUNCTION public.protect_last_administrator();
CREATE UNIQUE INDEX insights_unique_slug ON public.content_items ((data->>'slug')) WHERE collection = 'insights_items';