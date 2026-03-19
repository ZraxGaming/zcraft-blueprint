-- Storage buckets and RLS policies required for image uploads.
-- The avatar upload path is expected to be: user_id/filename.ext

INSERT INTO storage.buckets (id, name, public)
VALUES ('user_img', 'user_img', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('imgs', 'imgs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public avatars are viewable" ON storage.objects;
CREATE POLICY "Public avatars are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'user_img');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user_img'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'user_img'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user_img'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'user_img'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Public content images are viewable" ON storage.objects;
CREATE POLICY "Public content images are viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'imgs');

DROP POLICY IF EXISTS "Admins can manage content images" ON storage.objects;
CREATE POLICY "Admins can manage content images"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'imgs'
  AND EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
)
WITH CHECK (
  bucket_id = 'imgs'
  AND EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);
