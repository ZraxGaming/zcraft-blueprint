CREATE TABLE IF NOT EXISTS public.staff_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff applications: users can view own" ON public.staff_applications;
CREATE POLICY "Staff applications: users can view own"
ON public.staff_applications FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.users u
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
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);

INSERT INTO public.admin_settings (key, value)
VALUES
  ('staff_applications_enabled', 'false'),
  (
    'staff_application_form',
    '[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]'
  )
ON CONFLICT (key) DO NOTHING;
