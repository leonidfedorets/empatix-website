DROP POLICY IF EXISTS "public read items" ON public.content_items;
DROP POLICY IF EXISTS "public read published items" ON public.content_items;
DROP POLICY IF EXISTS "admins read all items" ON public.content_items;

CREATE POLICY "public read published items"
ON public.content_items
FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "admins read all items"
ON public.content_items
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;