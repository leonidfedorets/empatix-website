
CREATE POLICY "admins manage media objects" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'media' AND public.is_admin(auth.uid()));
CREATE POLICY "admins read media objects" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND public.is_admin(auth.uid()));
