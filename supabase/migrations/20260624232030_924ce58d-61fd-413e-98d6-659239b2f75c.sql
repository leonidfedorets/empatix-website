-- Lock down EXECUTE on SECURITY DEFINER functions to least-privilege.
-- bootstrap_super_admin and set_updated_at are trigger-only: nobody needs EXECUTE.
REVOKE ALL ON FUNCTION public.bootstrap_super_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role / is_admin are used inside RLS policies invoked by signed-in users only.
-- Revoke from PUBLIC and anon; keep EXECUTE for authenticated and service_role.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;