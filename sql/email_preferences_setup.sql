-- Email preferences setup for ZCraft
-- Safe to run multiple times

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
ON public.user_email_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can insert their email preferences"
ON public.user_email_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can update their email preferences"
ON public.user_email_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their email preferences" ON public.user_email_preferences;
CREATE POLICY "Users can delete their email preferences"
ON public.user_email_preferences
FOR DELETE
TO authenticated
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
