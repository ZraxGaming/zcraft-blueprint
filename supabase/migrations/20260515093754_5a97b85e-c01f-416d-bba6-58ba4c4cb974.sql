REVOKE SELECT ON public.users FROM anon, authenticated;
GRANT SELECT (id, username, avatar_url, bio, minecraft_name, role, created_at, updated_at) ON public.users TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_user_record()
RETURNS public.users
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM public.users WHERE id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.prevent_users_privileged_updates()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN RETURN NEW; END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.discord_id IS DISTINCT FROM OLD.discord_id
     OR NEW.google_id IS DISTINCT FROM OLD.google_id
     OR NEW.github_id IS DISTINCT FROM OLD.github_id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Not allowed to modify privileged fields';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS prevent_users_privileged_updates ON public.users;
CREATE TRIGGER prevent_users_privileged_updates
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_users_privileged_updates();

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_settings;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

DROP VIEW IF EXISTS public.latest_forum_threads;
CREATE VIEW public.latest_forum_threads WITH (security_invoker = true) AS
SELECT (p.id)::text AS id, p.title, COALESCE(u.username, 'Unknown'::text) AS author, COALESCE(p.category, ''::text) AS category, COALESCE(p.replies, 0) AS replies_count, p.created_at
FROM public.forum_posts p LEFT JOIN public.users u ON u.id = p.author_id
ORDER BY p.created_at DESC;

ALTER FUNCTION public.update_ban_appeals_updated_at() SET search_path = public;
ALTER FUNCTION public.touch_user_email_preferences_updated_at() SET search_path = public;
ALTER FUNCTION public.forum_posts_replies_count_trigger() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;