
-- Storage policies for the media bucket: admins write, public read
CREATE POLICY "media admin write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "media public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'media');
