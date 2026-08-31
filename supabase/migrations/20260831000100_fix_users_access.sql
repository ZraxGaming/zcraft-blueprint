-- Keep profile data public while protecting email addresses behind purpose-specific functions.
REVOKE SELECT ON public.users FROM anon, authenticated;
GRANT SELECT (id, username, avatar_url, bio, minecraft_name, role, created_at, updated_at)
ON public.users TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users: public profile select" ON public.users;
CREATE POLICY "Users: public profile select"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Users: own profile insert" ON public.users;
CREATE POLICY "Users: own profile insert"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users: own profile update" ON public.users;
CREATE POLICY "Users: own profile update"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users: admins can delete" ON public.users;
CREATE POLICY "Users: admins can delete"
ON public.users FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.get_email_by_username(lookup_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.users
  WHERE lower(username) = lower(lookup_username)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_email_by_username(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (id uuid, username text, email text, avatar_url text, created_at timestamptz, role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.username, u.email, u.avatar_url, u.created_at, COALESCE(r.role::text, 'user')
  FROM public.users u
  LEFT JOIN LATERAL (
    SELECT ur.role FROM public.user_roles ur
    WHERE ur.user_id = u.id
    ORDER BY CASE ur.role WHEN 'admin' THEN 1 WHEN 'moderator' THEN 2 ELSE 3 END
    LIMIT 1
  ) r ON true
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY u.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;