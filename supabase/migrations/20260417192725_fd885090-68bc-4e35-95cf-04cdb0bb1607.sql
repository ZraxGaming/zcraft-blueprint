-- Add foreign key from staff_applications.user_id -> users.id so the embedded
-- relationship `user:users(...)` works in PostgREST queries from the admin page.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'staff_applications_user_id_users_fkey'
  ) THEN
    ALTER TABLE public.staff_applications
      ADD CONSTRAINT staff_applications_user_id_users_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make sure RLS is enabled
ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

-- Drop overlapping/duplicated policies and recreate clean ones
DROP POLICY IF EXISTS "Staff applications: admins can manage" ON public.staff_applications;
DROP POLICY IF EXISTS "Staff applications: users can insert own" ON public.staff_applications;
DROP POLICY IF EXISTS "Staff applications: users can update own pending" ON public.staff_applications;
DROP POLICY IF EXISTS "Staff applications: users can view own" ON public.staff_applications;

-- Users can see their own applications
CREATE POLICY "apps_select_own"
ON public.staff_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Staff (admin/moderator/owner) can see all applications
CREATE POLICY "apps_select_staff"
ON public.staff_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);

-- Users can create their own application
CREATE POLICY "apps_insert_own"
ON public.staff_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending application
CREATE POLICY "apps_update_own_pending"
ON public.staff_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Staff can update / review any application
CREATE POLICY "apps_update_staff"
ON public.staff_applications
FOR UPDATE
TO authenticated
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

-- Staff can delete applications
CREATE POLICY "apps_delete_staff"
ON public.staff_applications
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'owner', 'moderator')
  )
);