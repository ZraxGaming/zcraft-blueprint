-- Safe all-in-one Supabase setup for ZCraft
-- This file is intended to be idempotent:
-- - existing buckets/settings/policies will not cause hard failures
-- - existing staff_applications tables will be upgraded in place
-- - existing storage setup will be preserved and normalized

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

/* ---------------------------------
   Storage buckets
   --------------------------------- */

INSERT INTO storage.buckets (id, name, public)
VALUES ('user_img', 'user_img', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('imgs', 'imgs', true)
ON CONFLICT (id) DO NOTHING;

/* ---------------------------------
   Storage policies
   --------------------------------- */

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

/* ---------------------------------
   Staff applications table
   --------------------------------- */

CREATE TABLE IF NOT EXISTS public.staff_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_role text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_applications
ADD COLUMN IF NOT EXISTS target_role text;

UPDATE public.staff_applications
SET target_role = 'moderator'
WHERE target_role IS NULL OR btrim(target_role) = '';

ALTER TABLE public.staff_applications
ALTER COLUMN target_role SET NOT NULL;

ALTER TABLE public.staff_applications
DROP CONSTRAINT IF EXISTS staff_applications_user_id_key;

ALTER TABLE public.staff_applications
DROP CONSTRAINT IF EXISTS staff_applications_user_id_target_role_key;

ALTER TABLE public.staff_applications
ADD CONSTRAINT staff_applications_user_id_target_role_key UNIQUE (user_id, target_role);

ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff applications: users can view own" ON public.staff_applications;
CREATE POLICY "Staff applications: users can view own"
ON public.staff_applications FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);

DROP POLICY IF EXISTS "Staff applications: users can insert own" ON public.staff_applications;
CREATE POLICY "Staff applications: users can insert own"
ON public.staff_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff applications: users can update own pending" ON public.staff_applications;
CREATE POLICY "Staff applications: users can update own pending"
ON public.staff_applications FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Staff applications: admins can manage" ON public.staff_applications;
CREATE POLICY "Staff applications: admins can manage"
ON public.staff_applications FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);

/* ---------------------------------
   Staff application settings
   --------------------------------- */

INSERT INTO public.admin_settings (key, value)
VALUES
  ('staff_applications_enabled', 'false'),
  (
    'staff_application_form',
    '[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]'
  ),
  (
    'staff_application_roles',
    '[{"id":"helper","label":"Helper","description":"Entry-level support for chat, tickets, and everyday player issues.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]},{"id":"moderator","label":"Moderator","description":"Moderate the server, handle reports, and keep the community healthy.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]},{"id":"builder","label":"Builder","description":"Help create maps, server visuals, and polished event spaces.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"portfolio","label":"Build portfolio or screenshots","type":"textarea","required":true,"placeholder":"Share links or describe your best builds."},{"id":"style","label":"What build styles are you strongest at?","type":"textarea","required":true,"placeholder":"Medieval, fantasy, modern, terrain, etc."}]}]'
  ),
  ('announcement_enabled', 'false'),
  ('announcement_message', ''),
  ('announcement_image', '')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

/* ---------------------------------
   Email preferences
   --------------------------------- */

CREATE TABLE IF NOT EXISTS public.user_email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_email_preferences_user_category_key UNIQUE (user_id, category)
);

ALTER TABLE public.user_email_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can view their email preferences"
ON public.user_email_preferences FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can insert their email preferences"
ON public.user_email_preferences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can update their email preferences"
ON public.user_email_preferences FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can delete their email preferences"
ON public.user_email_preferences FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_email_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_user_email_preferences_updated_at ON public.user_email_preferences;
CREATE TRIGGER touch_user_email_preferences_updated_at
BEFORE UPDATE ON public.user_email_preferences
FOR EACH ROW
EXECUTE FUNCTION public.touch_user_email_preferences_updated_at();

/* --------------------------------
   Changelogs table and policies
   -------------------------------- */

ALTER TABLE IF EXISTS public.changelogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Changelogs: public select" ON public.changelogs;
CREATE POLICY "Changelogs: public select"
ON public.changelogs FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Changelogs: admin write" ON public.changelogs;
CREATE POLICY "Changelogs: admin write"
ON public.changelogs FOR ALL
USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
